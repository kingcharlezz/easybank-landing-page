import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

interface StreamPayload {
  file: File;
  use_sse: boolean;
}

async function FileSummary(payload: StreamPayload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  console.log(`Fetching ${payload.file}`);
  const formData = new FormData();
  formData.append("model", "tiny");
  formData.append("use_sse", "true");
  formData.append("file", payload.file);
  
  const res = await fetch("https://brilliant-panda-production.up.railway.app/transcribe_file", {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    method: "POST",
    body: formData,
  });

  const stream = new ReadableStream({
    async start(controller) {
      // callback
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data.trim();
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          if (data) {  // Check if data is non-empty
            try {
              const json = JSON.parse(data);
              const text = json.text;
              const queue = encoder.encode(text);
              controller.enqueue(queue);
            } catch (error) {
              console.log('Data:', data);
            }
          }
      }
    }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse);
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}

export default async function handler(req: Request) {
  const { file } = (await req.json()) as {
    file?: File;
  };

  if (!file) {
    return new Response("No file!", { status: 500 });
  }

  try {
    const payload = {
      file: file,
      use_sse: true,
    };

    const stream = await FileSummary(payload);
    return new Response(stream);
  } catch (e: any) {
    console.log({ e });
    return new Response(e, { status: 500 });
  }
}