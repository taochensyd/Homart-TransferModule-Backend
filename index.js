const express = require("express");
const app = express();
const axios = require("axios");
require("dotenv").config();
app.use(express.json());
const port = 3005;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const sessionObj = {
  sessionId: null,
  sessionTime: null,
};

const loginToSAPSession = async () => {
  if (process.env.ENVIRONMENT === "HOME") {
    return;
  }

  try {
    const response = await axios.post(
      `${process.env.SAP_BASE_URL}/b1s/v1/Login`,
      {
        CompanyDB: process.env.DB_NAME,
        UserName: process.env.SAP_USERNAME,
        Password: process.env.SAP_PASSWORD,
      }
    );
    console.log(
      "response.headers['set-cookie']:",
      response.headers["set-cookie"]
    );
    console.log("response.data:" + response.data);

    const cookies = response.headers["set-cookie"];
    const b1SessionCookie = cookies
      .find((cookie) => cookie.startsWith("B1SESSION="))
      .split(";")[0];
    const routeIdCookie = cookies
      .find((cookie) => cookie.startsWith("ROUTEID="))
      .split(";")[0];
    const cookie = [b1SessionCookie, routeIdCookie].join("; ");

    sessionObj.sessionId = cookie;
    if (response.status === 200) {
      console.log("Logged in to SAP session");
      return response.status;
    } else {
      console.log("Failed to login to SAP session");
      return response.status;
    }
  } catch (error) {
    console.log("error.message:" + error.message);
  }
};

app.post("/api/login", async (req, res) => {
  if (process.env.ENVIRONMENT === "HOME") {
    res.status(200).send({ message: "Logged in to SAP session" });
  }

  let loginStatus = false;
  loginStatus = await loginToSAPSession();
  if (loginStatus === 200) {
    res.status(loginStatus).send({ message: "Logged in to SAP session" });
  } else {
    res.status(loginStatus).send({ message: "Failed to login to SAP session" });
  }
});

// User SAP account verify
app.post("/api/userAccount", async (req, res) => {
  if (process.env.ENVIRONMENT === "HOME") {
    return res.status(200).json({ count: 1 });
  }

  console.log("req.body:", req.body);
  const checkAccountBaseURL = `https://192.168.0.44:50000/b1s/v1/view.svc/Homart_CheckUserAccount_B1SLQuery()?$filter=U_UserCode eq '${req.body.sapusername}' and U_UserPW eq '${req.body.sappassword}'`;
  console.log(checkAccountBaseURL);

  try {
    const response = await axios.get(checkAccountBaseURL, {
      withCredentials: true,
      headers: {
        Cookie: sessionObj.sessionId,
      },
    });
    const count = response.data.value.length;
    console.log("/b1s/v1/view.svc/Homart_CheckUserAccount_B1SLQuery()");
    if (res.statusCode === 200 && count === 1) {
      res.status(200).send({ count });
    } else if (res.statusCode === 200) {
      res.status(200).send({ count });
    } else {
      res.statusCode(500).send({ count });
    }
  } catch (error) {
    console.log("error.message:", error.message);
    res.status(500).send(error.message);
  }

  //   Sample Response if username and password matched, if not matched, count = 0
  //   {
  //     "count": 1
  // }
});

// Batch number details
app.post("/api/batchnumberdetail", async (req, res) => {
  if (process.env.ENVIRONMENT === "HOME") {
    return res.status(200).json({
      "odata.metadata":
        "https://192.168.0.44:50000/b1s/v1/$metadata#BatchNumberDetails",
      value: [
        {
          DocEntry: 19425,
          ItemCode: "PB300-0010",
          ItemDescription: "Bottle 1HOM RA300ml Amber PET Bottle - JX",
          Status: "bdsStatus_Released",
          Batch: "H36592",
          BatchAttribute1: "S00403-Homart OEM",
          AdmissionDate: "2023-03-08",
          SystemNumber: 89,
          U_DateReleased: "2023-03-31",
          U_ClaimedQty: 19040,
          U_WarehouseComment: "(2P*16C+12C+8C)*272+(28C+8C)*136=19040",
          U_SupplierCode: "S00014-浙江上虞市佳星塑料製品有限公司 RMB/JX",
          U_InventoryUoM: "each",
        },
      ],
    });
  }

  console.log("req.body:", req.body);
  const getItemByBatchBaseURL = `https://192.168.0.44:50000/b1s/v1/BatchNumberDetails?$filter=Batch eq '${req.body.BatchNumber}'`;
  console.log(getItemByBatchBaseURL);
  console.log("sessionObj.sessionId: " + sessionObj.sessionId);
  try {
    const response = await axios.get(getItemByBatchBaseURL, {
      withCredentials: true,
      headers: {
        Cookie: sessionObj.sessionId,
        Prefer: "odata.maxpagesize=9999999999",
      },
    });
    console.log("/b1s/v1/BatchNumberDetails");
    res.send(response.data);
  } catch (error) {
    console.log("error.message:", error.message);
    res.status(500).send(error.message);
  }

  //   Sample Response
  // {
  //     "odata.metadata": "https://192.168.0.44:50000/b1s/v1/$metadata#BatchNumberDetails",
  //     "value": [
  //         {
  //             "DocEntry": 19425,
  //             "ItemCode": "PB300-0010",
  //             "ItemDescription": "Bottle 1HOM RA300ml Amber PET Bottle - JX",
  //             "Status": "bdsStatus_Released",
  //             "Batch": "H36592",
  //             "BatchAttribute1": "S00403-Homart OEM",
  //             "BatchAttribute2": null,
  //             "AdmissionDate": "2023-03-08",
  //             "ManufacturingDate": null,
  //             "ExpirationDate": null,
  //             "Details": null,
  //             "SystemNumber": 89,
  //             "U_DateReleased": "2023-03-31",
  //             "U_DateProcessed": null,
  //             "U_PestReason": null,
  //             "U_PackingSign": null,
  //             "U_LabelSample": null,
  //             "U_MilkSign": null,
  //             "U_Origin": null,
  //             "U_AQISNo": null,
  //             "U_F03H": null,
  //             "U_TransDelReced": null,
  //             "U_TransDelAccept": null,
  //             "U_ClaimedQty": 19040,
  //             "U_ShipperDamaged": "P",
  //             "U_DamagedReason": null,
  //             "U_ShipperLabel": "P",
  //             "U_LabelReason": null,
  //             "U_PestCheck": "P",
  //             "U_COAWeight": null,
  //             "U_WarehouseComment": "(2P*16C+12C+8C)*272+(28C+8C)*136=19040",
  //             "U_SuppCatNum": null,
  //             "U_SupplierCode": "S00014-浙江上虞市佳星塑料製品有限公司 RMB/JX",
  //             "U_GRPO": "GRPO",
  //             "U_InventoryUoM": "each",
  //             "U_AllowBatchDup": "N",
  //             "U_Manufacturer": null,
  //             "U_DeliveryNo": null,
  //             "U_InventoryNotes": null,
  //             "U_TestBeforeUse": "N"
  //         }
  //     ]
  // }
});

// Items
app.post("/api/items", async (req, res) => {
  if (process.env.ENVIRONMENT === "HOME") {
    return res.status(200).json({
      "odata.metadata":
        "https://192.168.0.44:50000/b1s/v1/$metadata#Items/@Element",
      "odata.etag": 'W/"DA4B9237BACCCDF19C0760CAB7AEC4A8359010B0"',
      ItemCode: "PLPID-0006",
      ItemName: "Label 1BSP Performance Inspired Turmeric Curcumin 120s",
      ForeignName: "Label Performance Inspired Turmeric Curcumin 120s",
      InventoryUOM: "each",
    });
  }

  console.log("req.body:", req.body);
  const getItemDetailByItemNumberBaseURL = `https://192.168.0.44:50000/b1s/v1/Items('${req.body.ItemNumber}')`;
  console.log(getItemDetailByItemNumberBaseURL);
  console.log("sessionObj.sessionId: " + sessionObj.sessionId);
  try {
    const response = await axios.get(getItemDetailByItemNumberBaseURL, {
      withCredentials: true,
      headers: {
        Cookie: sessionObj.sessionId,
        Prefer: "odata.maxpagesize=9999999999",
      },
    });
    console.log("/api/items");
    res.send(response.data);
  } catch (error) {
    console.log("error.message:", error.message);
    res.status(500).send(error.message);
  }
  /*
      Sample response from API
        //   Sample Response
//   {
//     "odata.metadata": "https://192.168.0.44:50000/b1s/v1/$metadata#Items/@Element",
//     "odata.etag": "W/\"DA4B9237BACCCDF19C0760CAB7AEC4A8359010B0\"",
//     "ItemCode": "PLPID-0006",
//     "ItemName": "Label 1BSP Performance Inspired Turmeric Curcumin 120s",
//     "ForeignName": "Label Performance Inspired Turmeric Curcumin 120s",
//     "InventoryUOM": "each"
// }
    */
});

// BinLocations
app.post("/api/binlocations", async (req, res) => {
  if (process.env.ENVIRONMENT === "HOME") {
    return res.status(200).json({
      "odata.metadata":
        "https://192.168.0.44:50000/b1s/v1/$metadata#BinLocations",
      value: [
        {
          AbsEntry: 2445,
          Warehouse: "WIQ",
          BinCode: "WIQ-0-04LOAD",
        },
        {
          AbsEntry: 8648,
          Warehouse: "WIQ",
          BinCode: "WIQ-0-08LOAD",
        },
        {
          AbsEntry: 1362,
          Warehouse: "WIQ",
          BinCode: "WIQ-1B18-3",
        },
        {
          AbsEntry: 4358,
          Warehouse: "WIQ",
          BinCode: "WIQ-3A35-1",
        },
        {
          AbsEntry: 4359,
          Warehouse: "WIQ",
          BinCode: "WIQ-3A35-2",
        },
        {
          AbsEntry: 4360,
          Warehouse: "WIQ",
          BinCode: "WIQ-3A35-3",
        },
        {
          AbsEntry: 1122,
          Warehouse: "WCP",
          BinCode: "WCP-3A35-3",
        },
        {
          AbsEntry: 1132,
          Warehouse: "WCP",
          BinCode: "WCP-3A35-8",
        },
        {
          AbsEntry: 1522,
          Warehouse: "WCP",
          BinCode: "WCP-0A95-3",
        },
      ],
    });
  }

  console.log("req.body:", req.body);
  // const getBinLocationBaseURL = `https://192.168.0.44:50000/b1s/v1/BinLocations?$select=AbsEntry,BinCode,Warehouse&$filter=Warehouse eq '${req.body.WarehouseCode}'`;
  const getBinLocationBaseURL = `https://192.168.0.44:50000/b1s/v1/BinLocations?$select=AbsEntry,BinCode,Warehouse`;
  console.log(getBinLocationBaseURL);
  console.log("sessionObj.sessionId: " + sessionObj.sessionId);
  try {
    const response = await axios.get(getBinLocationBaseURL, {
      withCredentials: true,
      headers: {
        Cookie: sessionObj.sessionId,
        Prefer: "odata.maxpagesize=999999999",
      },
    });
    console.log("/b1s/v1/BinLocations");
    console.log(`binlocation: ${response.data.value[0].AbsEntry}`);
    res.send(response.data);
  } catch (error) {
    console.log("error.message:", error.message);
    res.status(500).send(error.message);
  }
  // sample response
  /*
  {
    "odata.metadata": "https://192.168.0.44:50000/b1s/v1/$metadata#BinLocations",
    "value": [
        {
            "AbsEntry": 2445,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-0-04LOAD"
        },
        {
            "AbsEntry": 8648,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-0-08LOAD"
        },
        {
            "AbsEntry": 1362,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B18-3"
        }
        {
            "AbsEntry": 4358,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A35-1"
        },
        {
            "AbsEntry": 4359,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A35-2"
        },
        {
            "AbsEntry": 4360,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A35-3"
        }
    ]
}
*/
});

// Batch in Bin and Qty
app.post("/api/batchinbin", async (req, res) => {
  if (process.env.ENVIRONMENT === "HOME") {
    return res.status(200).json({
      "odata.metadata":
        "https://192.168.0.44:50000/b1s/v1/view.svc/$metadata#Homart_BatchInBinQty_B1SLQuery",
      value: [
        {
          ItemCode: "PC038-0010",
          ItemName:
            "Cap 1HOM 38mm Gold Cap for RA300/185 with Induction Seal - JX",
          DistNumber: "H36593",
          batchabsebntry: 19426,
          WhsCode: "WCP",
          WhsName: "Component warehouse",
          BinAbs: 671,
          BinCode: "WCP-3K20-1",
          OnHandQty: 19208,
          id__: 1,
        },
        {
          ItemCode: "PC038-0010",
          ItemName:
            "Cap 1HOM 38mm Gold Cap for RA300/185 with Induction Seal - JX",
          DistNumber: "H36593",
          batchabsebntry: 19426,
          WhsCode: "WIQ",
          WhsName: "Quantine warehouse",
          BinAbs: 1155,
          BinCode: "WIQ-7K52-1",
          OnHandQty: 5447,
          id__: 2,
        },
        {
          ItemCode: "PC0rrt38-0010",
          ItemName:
            "Cap 1HOM 38mm Gold Cap for RA300/185 with Induction Seal - JX",
          DistNumber: "H36593",
          batchabsebntry: 19426,
          WhsCode: "WCP",
          WhsName: "Component warehouse",
          BinAbs: 365,
          BinCode: "WCP-6K52-1",
          OnHandQty: 6975,
          id__: 3,
        },
        {
          ItemCode: "PC038-00ww10",
          ItemName:
            "Cap 1HOM 38mm Gold Cap for RA300/185 with Induction Seal - JX",
          DistNumber: "H36593",
          batchabsebntry: 19426,
          WhsCode: "WIQ",
          WhsName: "Component warehouse",
          BinAbs: 443,
          BinCode: "WIQ-9K52-1",
          OnHandQty: 147,
          id__: 4,
        },
      ],
    });
  }

  console.log("req.body:", req.body);
  const getBatchInBinBaseURL = `https://192.168.0.44:50000/b1s/v1/view.svc/Homart_B1_BatchInBinQty_B1SLQuery()?$filter=DistNumber eq '${req.body.BatchNumber}' and OnHandQty gt 0`;
  console.log(getBatchInBinBaseURL);
  console.log("sessionObj.sessionId: " + sessionObj.sessionId);
  try {
    const response = await axios.get(getBatchInBinBaseURL, {
      withCredentials: true,
      headers: {
        Cookie: sessionObj.sessionId,
        Prefer: "odata.maxpagesize=9999999999",
      },
    });
    console.log("/b1s/v1/view.svc/Homart_BatchInBinQty_B1SLQuery()");
    res.send(response.data);
  } catch (error) {
    console.log("error.message:", error.message);
    res.status(500).send(error.message);
  }

  // Sample Response
  //   {
  //     "odata.metadata": "https://192.168.0.44:50000/b1s/v1/view.svc/$metadata#Homart_BatchInBinQty_B1SLQuery",
  //     "value": [
  //         {
  //             "ItemCode": "PC038-0010",
  //             "ItemName": "Cap 1HOM 38mm Gold Cap for RA300/185 with Induction Seal - JX",
  //             "DistNumber": "H36593",
  //             "batchabsebntry": 19426,
  //             "WhsCode": "WCP",
  //             "WhsName": "Component warehouse",
  //             "BinAbs": 671,
  //             "BinCode": "WCP-1K20-1",
  //             "OnHandQty": 19208,
  //             "id__": 1
  //         }
  //     ]
  // }
});

// Get Journal Memo, This is the notes for the Web Transfer
app.post("/api/journalmemo", async (req, res) => {
  if (process.env.ENVIRONMENT === "HOME") {
    return res.status(200).json({
      "odata.metadata":
        "https://192.168.0.44:50000/b1s/v1/view.svc/$metadata#Homart_JournalMemo_B1SLQuery",
      value: [
        {
          JrnlMemo: "WEB STOCK Transferno:202307280005",
          id__: 1,
        },
      ],
    });
  }

  console.log("req.body:", req.body);
  const getJournalMemoBaseURL = `https://192.168.0.44:50000/b1s/v1/view.svc/Homart_JournalMemo_B1SLQuery()`;
  console.log(getJournalMemoBaseURL);
  console.log("getJournalMemoBaseURL: " + getJournalMemoBaseURL);
  try {
    const response = await axios.get(getJournalMemoBaseURL, {
      withCredentials: true,
      headers: {
        Cookie: sessionObj.sessionId,
        Prefer: "odata.maxpagesize=9999999999",
      },
    });
    console.log("/b1s/v1/view.svc/Homart_JournalMemo_B1SLQuery()");
    res.send(response.data);
  } catch (error) {
    console.log("error.message:", error.message);
    res.status(500).send(error.message);
  }

  // Sample Response
  //   {
  //     "odata.metadata": "https://192.168.0.44:50000/b1s/v1/view.svc/$metadata#Homart_JournalMemo_B1SLQuery",
  //     "value": [
  //         {
  //             "JrnlMemo": "WEB STOCK Transferno:202307280005",
  //             "id__": 1
  //         }
  //     ]
  // }
});

app.post("/api/stocktransfer", async (req, res) => {
  const stockTransferBaseURL = `https://192.168.0.44:50000/b1s/v1/StockTransfers`;
  try {
    const response = await axios.post(stockTransferBaseURL, req.body, {
      withCredentials: true,
      headers: {
        Cookie: sessionObj.sessionId,
      },
    });
    res.send(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

// app.post("/api/stocktransfer", async (req, res) => {
//   console.log("req.body:", req.body);
//   const stockTransferBaseURL = `https://192.168.0.44:50000/b1s/v1/StockTransfers`;
//   console.log(stockTransferBaseURL);
//   console.log("sessionObj.sessionId: " + sessionObj.sessionId);
//   try {
//     const response = await axios.post(stockTransferBaseURL, {
//       data: req.body,
//       withCredentials: true,
//       headers: {
//         Cookie: sessionObj.sessionId,
//         Prefer: "odata.maxpagesize=9999999999",
//       },
//     });
//     console.log("https://192.168.0.44:50000/b1s/v1/StockTransfers");
//     res.send(response.data);
//   } catch (error) {
//     console.log("error.message:", error.message);
//     res.status(500).send(error.message);
//   }
// });

app.listen(port, () => {
  console.log("Server listening on port " + port);
  // Call this function to get the SAP login and session ID when start the app
  loginToSAPSession();

  // Call this function every 28 minutes to keep the session alive (Default session timeout is 30 minutes, however 28 minutes is used to be safe)
  setInterval(loginToSAPSession, 28 * 60 * 1000);
});
