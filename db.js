import mysql from 'mysql2/promise';

//Modify the connection details to match the details specified while
//deploying the SingleStore cluster:
const HOST = 'svc-3031b160-473e-48f8-87f8-d2948b3cf195-dml.aws-virginia-6.svc.singlestore.com';
const USER = 'admin';
const PASSWORD = 'XGXbkb0Vd0OJfKCD705iTSnfpyzJLFAv';
const DATABASE = 'notescribe';

// main is run at the end
async function main() {
 let singleStoreConnection;
 try {
   singleStoreConnection = await mysql.createConnection({
     host: HOST,
     user: USER,
     password: PASSWORD,
     database: DATABASE
   });
  
   console.log("You have successfully connected to SingleStore.");
 } catch (err) { 
   console.error('ERROR', err);
   process.exit(1);
 } finally {
   if (singleStoreConnection) {
     await singleStoreConnection.end();
   }
 }
}

main();