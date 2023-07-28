const express = require("express");
const app = express();
const axios = require("axios");
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
  try {
    const response = await axios.post(
      "https://192.168.0.44:50000/b1s/v1/Login",
      {
        CompanyDB: "Homart_TEST8",
        UserName: "SAPCreatio",
        Password: "Bold#By68",
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
  } catch (error) {
    console.log("error.message:" + error.message);
  }
};

app.post("/api/login", async (req, res) => {
  await loginToSAPSession();
  res.send({ message: "Logged in to SAP session" });
});

// User SAP account verify
app.post("/api/userAccount", async (req, res) => {
  console.log("req.body:", req.body);
  const checkAccountBaseURL = `https://192.168.0.44:50000/b1s/v1/view.svc/Homart_CheckUserAccount_B1SLQuery()?$filter=U_UserCode eq '${req.body.sapusername}' and U_UserPW eq '${req.body.sappassword}'`;
  console.log(checkAccountBaseURL);
  console.log("sessionObj.sessionId: " + sessionObj.sessionId);
  try {
    const response = await axios.get(checkAccountBaseURL, {
      withCredentials: true,
      headers: {
        Cookie: sessionObj.sessionId,
      },
    });
    const count = response.data.value.length;
    res.send({ count });
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
    res.send(response.data);
  } catch (error) {
    console.log("error.message:", error.message);
    res.status(500).send(error.message);
  }
  //   Sample Response
//   {
//     "odata.metadata": "https://192.168.0.44:50000/b1s/v1/$metadata#Items/@Element",
//     "odata.etag": "W/\"DA4B9237BACCCDF19C0760CAB7AEC4A8359010B0\"",
//     "ItemCode": "PLPID-0006",
//     "ItemName": "Label 1BSP Performance Inspired Turmeric Curcumin 120s",
//     "ForeignName": "Label Performance Inspired Turmeric Curcumin 120s",
//     "ItemsGroupCode": 113,
//     "CustomsGroupCode": -1,
//     "SalesVATGroup": "S1",
//     "BarCode": null,
//     "VatLiable": "tYES",
//     "PurchaseItem": "tYES",
//     "SalesItem": "tYES",
//     "InventoryItem": "tYES",
//     "IncomeAccount": null,
//     "ExemptIncomeAccount": null,
//     "ExpanseAccount": null,
//     "Mainsupplier": null,
//     "SupplierCatalogNo": null,
//     "DesiredInventory": 0,
//     "MinInventory": 0,
//     "Picture": null,
//     "User_Text": null,
//     "SerialNum": null,
//     "CommissionPercent": 0,
//     "CommissionSum": 0,
//     "CommissionGroup": 0,
//     "TreeType": "iNotATree",
//     "AssetItem": "tNO",
//     "DataExportCode": null,
//     "Manufacturer": -1,
//     "QuantityOnStock": 227,
//     "QuantityOrderedFromVendors": 0,
//     "QuantityOrderedByCustomers": 0,
//     "ManageSerialNumbers": "tNO",
//     "ManageBatchNumbers": "tYES",
//     "Valid": "tYES",
//     "ValidFrom": null,
//     "ValidTo": null,
//     "ValidRemarks": null,
//     "Frozen": "tNO",
//     "FrozenFrom": null,
//     "FrozenTo": null,
//     "FrozenRemarks": null,
//     "SalesUnit": "1000",
//     "SalesItemsPerUnit": 1000,
//     "SalesPackagingUnit": null,
//     "SalesQtyPerPackUnit": 1,
//     "SalesUnitLength": null,
//     "SalesLengthUnit": null,
//     "SalesUnitWidth": null,
//     "SalesWidthUnit": null,
//     "SalesUnitHeight": null,
//     "SalesHeightUnit": null,
//     "SalesUnitVolume": 0,
//     "SalesVolumeUnit": 4,
//     "SalesUnitWeight": null,
//     "SalesWeightUnit": null,
//     "PurchaseUnit": "1000",
//     "PurchaseItemsPerUnit": 1000,
//     "PurchasePackagingUnit": null,
//     "PurchaseQtyPerPackUnit": 1,
//     "PurchaseUnitLength": null,
//     "PurchaseLengthUnit": null,
//     "PurchaseUnitWidth": null,
//     "PurchaseWidthUnit": null,
//     "PurchaseUnitHeight": null,
//     "PurchaseHeightUnit": null,
//     "PurchaseUnitVolume": 0,
//     "PurchaseVolumeUnit": 4,
//     "PurchaseUnitWeight": null,
//     "PurchaseWeightUnit": null,
//     "PurchaseVATGroup": "P1",
//     "SalesFactor1": 1,
//     "SalesFactor2": 1,
//     "SalesFactor3": 1,
//     "SalesFactor4": 1,
//     "PurchaseFactor1": 1,
//     "PurchaseFactor2": 1,
//     "PurchaseFactor3": 1,
//     "PurchaseFactor4": 1,
//     "MovingAveragePrice": 0.102,
//     "ForeignRevenuesAccount": null,
//     "ECRevenuesAccount": null,
//     "ForeignExpensesAccount": null,
//     "ECExpensesAccount": null,
//     "AvgStdPrice": 0.102,
//     "DefaultWarehouse": "WCP",
//     "ShipType": 19,
//     "GLMethod": "glm_ItemClass",
//     "TaxType": "tt_Yes",
//     "MaxInventory": 0,
//     "ManageStockByWarehouse": "tNO",
//     "PurchaseHeightUnit1": null,
//     "PurchaseUnitHeight1": null,
//     "PurchaseLengthUnit1": null,
//     "PurchaseUnitLength1": null,
//     "PurchaseWeightUnit1": null,
//     "PurchaseUnitWeight1": null,
//     "PurchaseWidthUnit1": null,
//     "PurchaseUnitWidth1": null,
//     "SalesHeightUnit1": null,
//     "SalesUnitHeight1": null,
//     "SalesLengthUnit1": null,
//     "SalesUnitLength1": null,
//     "SalesWeightUnit1": null,
//     "SalesUnitWeight1": null,
//     "SalesWidthUnit1": null,
//     "SalesUnitWidth1": null,
//     "ForceSelectionOfSerialNumber": "tYES",
//     "ManageSerialNumbersOnReleaseOnly": "tNO",
//     "WTLiable": "tNO",
//     "CostAccountingMethod": "bis_MovingAverage",
//     "SWW": null,
//     "WarrantyTemplate": "",
//     "IndirectTax": "tNO",
//     "ArTaxCode": null,
//     "ApTaxCode": null,
//     "BaseUnitName": null,
//     "ItemCountryOrg": null,
//     "IssueMethod": "im_Manual",
//     "SRIAndBatchManageMethod": "bomm_OnEveryTransaction",
//     "IsPhantom": "tNO",
//     "InventoryUOM": "each",
//     "PlanningSystem": "bop_MRP",
//     "ProcurementMethod": "bom_Buy",
//     "ComponentWarehouse": "bomcw_BOM",
//     "OrderIntervals": null,
//     "OrderMultiple": 0,
//     "LeadTime": null,
//     "MinOrderQuantity": 0,
//     "ItemType": "itItems",
//     "ItemClass": "itcMaterial",
//     "OutgoingServiceCode": -1,
//     "IncomingServiceCode": -1,
//     "ServiceGroup": -1,
//     "NCMCode": -1,
//     "MaterialType": "mt_FinishedGoods",
//     "MaterialGroup": -1,
//     "ProductSource": "",
//     "Properties1": "tNO",
//     "Properties2": "tNO",
//     "Properties3": "tNO",
//     "Properties4": "tNO",
//     "Properties5": "tNO",
//     "Properties6": "tNO",
//     "Properties7": "tNO",
//     "Properties8": "tNO",
//     "Properties9": "tNO",
//     "Properties10": "tNO",
//     "Properties11": "tNO",
//     "Properties12": "tNO",
//     "Properties13": "tNO",
//     "Properties14": "tYES",
//     "Properties15": "tNO",
//     "Properties16": "tNO",
//     "Properties17": "tNO",
//     "Properties18": "tNO",
//     "Properties19": "tNO",
//     "Properties20": "tNO",
//     "Properties21": "tNO",
//     "Properties22": "tNO",
//     "Properties23": "tNO",
//     "Properties24": "tNO",
//     "Properties25": "tNO",
//     "Properties26": "tNO",
//     "Properties27": "tNO",
//     "Properties28": "tNO",
//     "Properties29": "tNO",
//     "Properties30": "tNO",
//     "Properties31": "tNO",
//     "Properties32": "tNO",
//     "Properties33": "tNO",
//     "Properties34": "tNO",
//     "Properties35": "tNO",
//     "Properties36": "tNO",
//     "Properties37": "tNO",
//     "Properties38": "tNO",
//     "Properties39": "tNO",
//     "Properties40": "tNO",
//     "Properties41": "tNO",
//     "Properties42": "tNO",
//     "Properties43": "tNO",
//     "Properties44": "tNO",
//     "Properties45": "tNO",
//     "Properties46": "tNO",
//     "Properties47": "tNO",
//     "Properties48": "tNO",
//     "Properties49": "tNO",
//     "Properties50": "tNO",
//     "Properties51": "tNO",
//     "Properties52": "tNO",
//     "Properties53": "tNO",
//     "Properties54": "tNO",
//     "Properties55": "tNO",
//     "Properties56": "tNO",
//     "Properties57": "tNO",
//     "Properties58": "tNO",
//     "Properties59": "tNO",
//     "Properties60": "tNO",
//     "Properties61": "tNO",
//     "Properties62": "tNO",
//     "Properties63": "tNO",
//     "Properties64": "tNO",
//     "AutoCreateSerialNumbersOnRelease": "tNO",
//     "DNFEntry": -1,
//     "GTSItemSpec": null,
//     "GTSItemTaxCategory": null,
//     "FuelID": null,
//     "BeverageTableCode": "",
//     "BeverageGroupCode": "",
//     "BeverageCommercialBrandCode": null,
//     "Series": 3,
//     "ToleranceDays": null,
//     "TypeOfAdvancedRules": "toarGeneral",
//     "IssuePrimarilyBy": "ipbSerialAndBatchNumbers",
//     "NoDiscounts": "tNO",
//     "AssetClass": "",
//     "AssetGroup": "",
//     "InventoryNumber": "",
//     "Technician": null,
//     "Employee": null,
//     "Location": null,
//     "AssetStatus": "New",
//     "CapitalizationDate": null,
//     "StatisticalAsset": "tNO",
//     "Cession": "tNO",
//     "DeactivateAfterUsefulLife": "tNO",
//     "ManageByQuantity": "tNO",
//     "UoMGroupEntry": -1,
//     "InventoryUoMEntry": -1,
//     "DefaultSalesUoMEntry": null,
//     "DefaultPurchasingUoMEntry": null,
//     "DepreciationGroup": null,
//     "AssetSerialNumber": "",
//     "InventoryWeight": null,
//     "InventoryWeightUnit": null,
//     "InventoryWeight1": null,
//     "InventoryWeightUnit1": null,
//     "DefaultCountingUnit": null,
//     "CountingItemsPerUnit": 1,
//     "DefaultCountingUoMEntry": null,
//     "Excisable": "tNO",
//     "ChapterID": -1,
//     "ScsCode": null,
//     "SpProdType": null,
//     "ProdStdCost": 0,
//     "InCostRollup": "tYES",
//     "VirtualAssetItem": "tNO",
//     "EnforceAssetSerialNumbers": "tNO",
//     "AttachmentEntry": null,
//     "LinkedResource": null,
//     "UpdateDate": "2022-05-13",
//     "UpdateTime": "11:41:26",
//     "GSTRelevnt": "tNO",
//     "SACEntry": -1,
//     "GSTTaxCategory": "gtc_Regular",
//     "ServiceCategoryEntry": -1,
//     "CapitalGoodsOnHoldPercent": null,
//     "CapitalGoodsOnHoldLimit": null,
//     "AssessableValue": 0,
//     "AssVal4WTR": 0,
//     "SOIExcisable": "se_NotExcisable",
//     "TNVED": null,
//     "ImportedItem": "tNO",
//     "PricingUnit": -1,
//     "CreateDate": "2022-05-13",
//     "CreateTime": "11:41:26",
//     "NVECode": null,
//     "CtrSealQty": null,
//     "CESTCode": -1,
//     "LegalText": null,
//     "DataVersion": 2,
//     "CreateQRCodeFrom": null,
//     "TraceableItem": "tNO",
//     "U_MYOBItemCode": null,
//     "U_WFPLocation": null,
//     "U_Compatiable": "0",
//     "U_QAVersion": null,
//     "U_Manufacturers": null,
//     "ItemPrices": [
//         {
//             "PriceList": 1,
//             "Price": 0,
//             "Currency": "",
//             "AdditionalPrice1": 0,
//             "AdditionalCurrency1": "",
//             "AdditionalPrice2": 0,
//             "AdditionalCurrency2": "",
//             "BasePriceList": 1,
//             "Factor": 1,
//             "UoMPrices": []
//         },
//         {
//             "PriceList": 2,
//             "Price": 0,
//             "Currency": "",
//             "AdditionalPrice1": 0,
//             "AdditionalCurrency1": "",
//             "AdditionalPrice2": 0,
//             "AdditionalCurrency2": "",
//             "BasePriceList": 2,
//             "Factor": 1,
//             "UoMPrices": []
//         },
//         {
//             "PriceList": 3,
//             "Price": 0,
//             "Currency": "",
//             "AdditionalPrice1": 0,
//             "AdditionalCurrency1": "",
//             "AdditionalPrice2": 0,
//             "AdditionalCurrency2": "",
//             "BasePriceList": 3,
//             "Factor": 1,
//             "UoMPrices": []
//         },
//         {
//             "PriceList": 4,
//             "Price": 0,
//             "Currency": "",
//             "AdditionalPrice1": 0,
//             "AdditionalCurrency1": "",
//             "AdditionalPrice2": 0,
//             "AdditionalCurrency2": "",
//             "BasePriceList": 4,
//             "Factor": 1,
//             "UoMPrices": []
//         },
//         {
//             "PriceList": 5,
//             "Price": 0,
//             "Currency": "",
//             "AdditionalPrice1": 0,
//             "AdditionalCurrency1": "",
//             "AdditionalPrice2": 0,
//             "AdditionalCurrency2": "",
//             "BasePriceList": 5,
//             "Factor": 1,
//             "UoMPrices": []
//         },
//         {
//             "PriceList": 6,
//             "Price": 0,
//             "Currency": "",
//             "AdditionalPrice1": 0,
//             "AdditionalCurrency1": "",
//             "AdditionalPrice2": 0,
//             "AdditionalCurrency2": "",
//             "BasePriceList": 6,
//             "Factor": 1,
//             "UoMPrices": []
//         }
//     ],
//     "ItemWarehouseInfoCollection": [
//         {
//             "MinimalStock": 0,
//             "MaximalStock": 0,
//             "MinimalOrder": 0,
//             "StandardAveragePrice": 0,
//             "Locked": "tNO",
//             "InventoryAccount": null,
//             "CostAccount": null,
//             "TransferAccount": null,
//             "RevenuesAccount": null,
//             "VarienceAccount": null,
//             "DecreasingAccount": null,
//             "IncreasingAccount": null,
//             "ReturningAccount": null,
//             "ExpensesAccount": null,
//             "EURevenuesAccount": null,
//             "EUExpensesAccount": null,
//             "ForeignRevenueAcc": null,
//             "ForeignExpensAcc": null,
//             "ExemptIncomeAcc": null,
//             "PriceDifferenceAcc": null,
//             "WarehouseCode": "W3P",
//             "InStock": 0,
//             "Committed": 0,
//             "Ordered": 0,
//             "CountedQuantity": 0,
//             "WasCounted": "tNO",
//             "UserSignature": 20,
//             "Counted": 0,
//             "ExpenseClearingAct": null,
//             "PurchaseCreditAcc": null,
//             "EUPurchaseCreditAcc": null,
//             "ForeignPurchaseCreditAcc": null,
//             "SalesCreditAcc": null,
//             "SalesCreditEUAcc": null,
//             "ExemptedCredits": null,
//             "SalesCreditForeignAcc": null,
//             "ExpenseOffsettingAccount": null,
//             "WipAccount": null,
//             "ExchangeRateDifferencesAcct": null,
//             "GoodsClearingAcct": null,
//             "NegativeInventoryAdjustmentAccount": null,
//             "CostInflationOffsetAccount": null,
//             "GLDecreaseAcct": null,
//             "GLIncreaseAcct": null,
//             "PAReturnAcct": null,
//             "PurchaseAcct": null,
//             "PurchaseOffsetAcct": null,
//             "ShippedGoodsAccount": null,
//             "StockInflationOffsetAccount": null,
//             "StockInflationAdjustAccount": null,
//             "VATInRevenueAccount": null,
//             "WipVarianceAccount": null,
//             "CostInflationAccount": null,
//             "WHIncomingCenvatAccount": null,
//             "WHOutgoingCenvatAccount": null,
//             "StockInTransitAccount": null,
//             "WipOffsetProfitAndLossAccount": null,
//             "InventoryOffsetProfitAndLossAccount": null,
//             "DefaultBin": null,
//             "DefaultBinEnforced": "tNO",
//             "PurchaseBalanceAccount": null,
//             "ItemCode": "PLPID-0006",
//             "IndEscala": "tYES",
//             "CNJPMan": null,
//             "ItemCycleCounts": []
//         },
//         {
//             "MinimalStock": 0,
//             "MaximalStock": 0,
//             "MinimalOrder": 0,
//             "StandardAveragePrice": 0,
//             "Locked": "tNO",
//             "InventoryAccount": null,
//             "CostAccount": null,
//             "TransferAccount": null,
//             "RevenuesAccount": null,
//             "VarienceAccount": null,
//             "DecreasingAccount": null,
//             "IncreasingAccount": null,
//             "ReturningAccount": null,
//             "ExpensesAccount": null,
//             "EURevenuesAccount": null,
//             "EUExpensesAccount": null,
//             "ForeignRevenueAcc": null,
//             "ForeignExpensAcc": null,
//             "ExemptIncomeAcc": null,
//             "PriceDifferenceAcc": null,
//             "WarehouseCode": "W3Q",
//             "InStock": 0,
//             "Committed": 0,
//             "Ordered": 0,
//             "CountedQuantity": 0,
//             "WasCounted": "tNO",
//             "UserSignature": 1,
//             "Counted": 0,
//             "ExpenseClearingAct": null,
//             "PurchaseCreditAcc": null,
//             "EUPurchaseCreditAcc": null,
//             "ForeignPurchaseCreditAcc": null,
//             "SalesCreditAcc": null,
//             "SalesCreditEUAcc": null,
//             "ExemptedCredits": null,
//             "SalesCreditForeignAcc": null,
//             "ExpenseOffsettingAccount": null,
//             "WipAccount": null,
//             "ExchangeRateDifferencesAcct": null,
//             "GoodsClearingAcct": null,
//             "NegativeInventoryAdjustmentAccount": null,
//             "CostInflationOffsetAccount": null,
//             "GLDecreaseAcct": null,
//             "GLIncreaseAcct": null,
//             "PAReturnAcct": null,
//             "PurchaseAcct": null,
//             "PurchaseOffsetAcct": null,
//             "ShippedGoodsAccount": null,
//             "StockInflationOffsetAccount": null,
//             "StockInflationAdjustAccount": null,
//             "VATInRevenueAccount": null,
//             "WipVarianceAccount": null,
//             "CostInflationAccount": null,
//             "WHIncomingCenvatAccount": null,
//             "WHOutgoingCenvatAccount": null,
//             "StockInTransitAccount": null,
//             "WipOffsetProfitAndLossAccount": null,
//             "InventoryOffsetProfitAndLossAccount": null,
//             "DefaultBin": null,
//             "DefaultBinEnforced": "tNO",
//             "PurchaseBalanceAccount": null,
//             "ItemCode": "PLPID-0006",
//             "IndEscala": "tYES",
//             "CNJPMan": null,
//             "ItemCycleCounts": []
//         },
//         {
//             "MinimalStock": 0,
//             "MaximalStock": 0,
//             "MinimalOrder": 0,
//             "StandardAveragePrice": 0,
//             "Locked": "tNO",
//             "InventoryAccount": null,
//             "CostAccount": null,
//             "TransferAccount": null,
//             "RevenuesAccount": null,
//             "VarienceAccount": null,
//             "DecreasingAccount": null,
//             "IncreasingAccount": null,
//             "ReturningAccount": null,
//             "ExpensesAccount": null,
//             "EURevenuesAccount": null,
//             "EUExpensesAccount": null,
//             "ForeignRevenueAcc": null,
//             "ForeignExpensAcc": null,
//             "ExemptIncomeAcc": null,
//             "PriceDifferenceAcc": null,
//             "WarehouseCode": "WCP",
//             "InStock": 227,
//             "Committed": 0,
//             "Ordered": 0,
//             "CountedQuantity": 0,
//             "WasCounted": "tNO",
//             "UserSignature": 20,
//             "Counted": 0,
//             "ExpenseClearingAct": null,
//             "PurchaseCreditAcc": null,
//             "EUPurchaseCreditAcc": null,
//             "ForeignPurchaseCreditAcc": null,
//             "SalesCreditAcc": null,
//             "SalesCreditEUAcc": null,
//             "ExemptedCredits": null,
//             "SalesCreditForeignAcc": null,
//             "ExpenseOffsettingAccount": null,
//             "WipAccount": null,
//             "ExchangeRateDifferencesAcct": null,
//             "GoodsClearingAcct": null,
//             "NegativeInventoryAdjustmentAccount": null,
//             "CostInflationOffsetAccount": null,
//             "GLDecreaseAcct": null,
//             "GLIncreaseAcct": null,
//             "PAReturnAcct": null,
//             "PurchaseAcct": null,
//             "PurchaseOffsetAcct": null,
//             "ShippedGoodsAccount": null,
//             "StockInflationOffsetAccount": null,
//             "StockInflationAdjustAccount": null,
//             "VATInRevenueAccount": null,
//             "WipVarianceAccount": null,
//             "CostInflationAccount": null,
//             "WHIncomingCenvatAccount": null,
//             "WHOutgoingCenvatAccount": null,
//             "StockInTransitAccount": null,
//             "WipOffsetProfitAndLossAccount": null,
//             "InventoryOffsetProfitAndLossAccount": null,
//             "DefaultBin": null,
//             "DefaultBinEnforced": "tNO",
//             "PurchaseBalanceAccount": null,
//             "ItemCode": "PLPID-0006",
//             "IndEscala": "tYES",
//             "CNJPMan": null,
//             "ItemCycleCounts": []
//         },
//         {
//             "MinimalStock": 0,
//             "MaximalStock": 0,
//             "MinimalOrder": 0,
//             "StandardAveragePrice": 0,
//             "Locked": "tNO",
//             "InventoryAccount": null,
//             "CostAccount": null,
//             "TransferAccount": null,
//             "RevenuesAccount": null,
//             "VarienceAccount": null,
//             "DecreasingAccount": null,
//             "IncreasingAccount": null,
//             "ReturningAccount": null,
//             "ExpensesAccount": null,
//             "EURevenuesAccount": null,
//             "EUExpensesAccount": null,
//             "ForeignRevenueAcc": null,
//             "ForeignExpensAcc": null,
//             "ExemptIncomeAcc": null,
//             "PriceDifferenceAcc": null,
//             "WarehouseCode": "WCS",
//             "InStock": 0,
//             "Committed": 0,
//             "Ordered": 0,
//             "CountedQuantity": 0,
//             "WasCounted": "tNO",
//             "UserSignature": 20,
//             "Counted": 0,
//             "ExpenseClearingAct": null,
//             "PurchaseCreditAcc": null,
//             "EUPurchaseCreditAcc": null,
//             "ForeignPurchaseCreditAcc": null,
//             "SalesCreditAcc": null,
//             "SalesCreditEUAcc": null,
//             "ExemptedCredits": null,
//             "SalesCreditForeignAcc": null,
//             "ExpenseOffsettingAccount": null,
//             "WipAccount": null,
//             "ExchangeRateDifferencesAcct": null,
//             "GoodsClearingAcct": null,
//             "NegativeInventoryAdjustmentAccount": null,
//             "CostInflationOffsetAccount": null,
//             "GLDecreaseAcct": null,
//             "GLIncreaseAcct": null,
//             "PAReturnAcct": null,
//             "PurchaseAcct": null,
//             "PurchaseOffsetAcct": null,
//             "ShippedGoodsAccount": null,
//             "StockInflationOffsetAccount": null,
//             "StockInflationAdjustAccount": null,
//             "VATInRevenueAccount": null,
//             "WipVarianceAccount": null,
//             "CostInflationAccount": null,
//             "WHIncomingCenvatAccount": null,
//             "WHOutgoingCenvatAccount": null,
//             "StockInTransitAccount": null,
//             "WipOffsetProfitAndLossAccount": null,
//             "InventoryOffsetProfitAndLossAccount": null,
//             "DefaultBin": null,
//             "DefaultBinEnforced": "tNO",
//             "PurchaseBalanceAccount": null,
//             "ItemCode": "PLPID-0006",
//             "IndEscala": "tYES",
//             "CNJPMan": null,
//             "ItemCycleCounts": []
//         },
//         {
//             "MinimalStock": 0,
//             "MaximalStock": 0,
//             "MinimalOrder": 0,
//             "StandardAveragePrice": 0,
//             "Locked": "tNO",
//             "InventoryAccount": null,
//             "CostAccount": null,
//             "TransferAccount": null,
//             "RevenuesAccount": null,
//             "VarienceAccount": null,
//             "DecreasingAccount": null,
//             "IncreasingAccount": null,
//             "ReturningAccount": null,
//             "ExpensesAccount": null,
//             "EURevenuesAccount": null,
//             "EUExpensesAccount": null,
//             "ForeignRevenueAcc": null,
//             "ForeignExpensAcc": null,
//             "ExemptIncomeAcc": null,
//             "PriceDifferenceAcc": null,
//             "WarehouseCode": "WFP",
//             "InStock": 0,
//             "Committed": 0,
//             "Ordered": 0,
//             "CountedQuantity": 0,
//             "WasCounted": "tNO",
//             "UserSignature": 20,
//             "Counted": 0,
//             "ExpenseClearingAct": null,
//             "PurchaseCreditAcc": null,
//             "EUPurchaseCreditAcc": null,
//             "ForeignPurchaseCreditAcc": null,
//             "SalesCreditAcc": null,
//             "SalesCreditEUAcc": null,
//             "ExemptedCredits": null,
//             "SalesCreditForeignAcc": null,
//             "ExpenseOffsettingAccount": null,
//             "WipAccount": null,
//             "ExchangeRateDifferencesAcct": null,
//             "GoodsClearingAcct": null,
//             "NegativeInventoryAdjustmentAccount": null,
//             "CostInflationOffsetAccount": null,
//             "GLDecreaseAcct": null,
//             "GLIncreaseAcct": null,
//             "PAReturnAcct": null,
//             "PurchaseAcct": null,
//             "PurchaseOffsetAcct": null,
//             "ShippedGoodsAccount": null,
//             "StockInflationOffsetAccount": null,
//             "StockInflationAdjustAccount": null,
//             "VATInRevenueAccount": null,
//             "WipVarianceAccount": null,
//             "CostInflationAccount": null,
//             "WHIncomingCenvatAccount": null,
//             "WHOutgoingCenvatAccount": null,
//             "StockInTransitAccount": null,
//             "WipOffsetProfitAndLossAccount": null,
//             "InventoryOffsetProfitAndLossAccount": null,
//             "DefaultBin": null,
//             "DefaultBinEnforced": "tNO",
//             "PurchaseBalanceAccount": null,
//             "ItemCode": "PLPID-0006",
//             "IndEscala": "tYES",
//             "CNJPMan": null,
//             "ItemCycleCounts": []
//         },
//         {
//             "MinimalStock": 0,
//             "MaximalStock": 0,
//             "MinimalOrder": 0,
//             "StandardAveragePrice": 0,
//             "Locked": "tNO",
//             "InventoryAccount": null,
//             "CostAccount": null,
//             "TransferAccount": null,
//             "RevenuesAccount": null,
//             "VarienceAccount": null,
//             "DecreasingAccount": null,
//             "IncreasingAccount": null,
//             "ReturningAccount": null,
//             "ExpensesAccount": null,
//             "EURevenuesAccount": null,
//             "EUExpensesAccount": null,
//             "ForeignRevenueAcc": null,
//             "ForeignExpensAcc": null,
//             "ExemptIncomeAcc": null,
//             "PriceDifferenceAcc": null,
//             "WarehouseCode": "WIQ",
//             "InStock": 0,
//             "Committed": 0,
//             "Ordered": 0,
//             "CountedQuantity": 0,
//             "WasCounted": "tNO",
//             "UserSignature": 20,
//             "Counted": 0,
//             "ExpenseClearingAct": null,
//             "PurchaseCreditAcc": null,
//             "EUPurchaseCreditAcc": null,
//             "ForeignPurchaseCreditAcc": null,
//             "SalesCreditAcc": null,
//             "SalesCreditEUAcc": null,
//             "ExemptedCredits": null,
//             "SalesCreditForeignAcc": null,
//             "ExpenseOffsettingAccount": null,
//             "WipAccount": null,
//             "ExchangeRateDifferencesAcct": null,
//             "GoodsClearingAcct": null,
//             "NegativeInventoryAdjustmentAccount": null,
//             "CostInflationOffsetAccount": null,
//             "GLDecreaseAcct": null,
//             "GLIncreaseAcct": null,
//             "PAReturnAcct": null,
//             "PurchaseAcct": null,
//             "PurchaseOffsetAcct": null,
//             "ShippedGoodsAccount": null,
//             "StockInflationOffsetAccount": null,
//             "StockInflationAdjustAccount": null,
//             "VATInRevenueAccount": null,
//             "WipVarianceAccount": null,
//             "CostInflationAccount": null,
//             "WHIncomingCenvatAccount": null,
//             "WHOutgoingCenvatAccount": null,
//             "StockInTransitAccount": null,
//             "WipOffsetProfitAndLossAccount": null,
//             "InventoryOffsetProfitAndLossAccount": null,
//             "DefaultBin": null,
//             "DefaultBinEnforced": "tNO",
//             "PurchaseBalanceAccount": null,
//             "ItemCode": "PLPID-0006",
//             "IndEscala": "tYES",
//             "CNJPMan": null,
//             "ItemCycleCounts": []
//         },
//         {
//             "MinimalStock": 0,
//             "MaximalStock": 0,
//             "MinimalOrder": 0,
//             "StandardAveragePrice": 0,
//             "Locked": "tNO",
//             "InventoryAccount": null,
//             "CostAccount": null,
//             "TransferAccount": null,
//             "RevenuesAccount": null,
//             "VarienceAccount": null,
//             "DecreasingAccount": null,
//             "IncreasingAccount": null,
//             "ReturningAccount": null,
//             "ExpensesAccount": null,
//             "EURevenuesAccount": null,
//             "EUExpensesAccount": null,
//             "ForeignRevenueAcc": null,
//             "ForeignExpensAcc": null,
//             "ExemptIncomeAcc": null,
//             "PriceDifferenceAcc": null,
//             "WarehouseCode": "WPQ",
//             "InStock": 0,
//             "Committed": 0,
//             "Ordered": 0,
//             "CountedQuantity": 0,
//             "WasCounted": "tNO",
//             "UserSignature": 20,
//             "Counted": 0,
//             "ExpenseClearingAct": null,
//             "PurchaseCreditAcc": null,
//             "EUPurchaseCreditAcc": null,
//             "ForeignPurchaseCreditAcc": null,
//             "SalesCreditAcc": null,
//             "SalesCreditEUAcc": null,
//             "ExemptedCredits": null,
//             "SalesCreditForeignAcc": null,
//             "ExpenseOffsettingAccount": null,
//             "WipAccount": null,
//             "ExchangeRateDifferencesAcct": null,
//             "GoodsClearingAcct": null,
//             "NegativeInventoryAdjustmentAccount": null,
//             "CostInflationOffsetAccount": null,
//             "GLDecreaseAcct": null,
//             "GLIncreaseAcct": null,
//             "PAReturnAcct": null,
//             "PurchaseAcct": null,
//             "PurchaseOffsetAcct": null,
//             "ShippedGoodsAccount": null,
//             "StockInflationOffsetAccount": null,
//             "StockInflationAdjustAccount": null,
//             "VATInRevenueAccount": null,
//             "WipVarianceAccount": null,
//             "CostInflationAccount": null,
//             "WHIncomingCenvatAccount": null,
//             "WHOutgoingCenvatAccount": null,
//             "StockInTransitAccount": null,
//             "WipOffsetProfitAndLossAccount": null,
//             "InventoryOffsetProfitAndLossAccount": null,
//             "DefaultBin": null,
//             "DefaultBinEnforced": "tNO",
//             "PurchaseBalanceAccount": null,
//             "ItemCode": "PLPID-0006",
//             "IndEscala": "tYES",
//             "CNJPMan": null,
//             "ItemCycleCounts": []
//         },
//         {
//             "MinimalStock": 0,
//             "MaximalStock": 0,
//             "MinimalOrder": 0,
//             "StandardAveragePrice": 0,
//             "Locked": "tNO",
//             "InventoryAccount": null,
//             "CostAccount": null,
//             "TransferAccount": null,
//             "RevenuesAccount": null,
//             "VarienceAccount": null,
//             "DecreasingAccount": null,
//             "IncreasingAccount": null,
//             "ReturningAccount": null,
//             "ExpensesAccount": null,
//             "EURevenuesAccount": null,
//             "EUExpensesAccount": null,
//             "ForeignRevenueAcc": null,
//             "ForeignExpensAcc": null,
//             "ExemptIncomeAcc": null,
//             "PriceDifferenceAcc": null,
//             "WarehouseCode": "WPR",
//             "InStock": 0,
//             "Committed": 0,
//             "Ordered": 0,
//             "CountedQuantity": 0,
//             "WasCounted": "tNO",
//             "UserSignature": 20,
//             "Counted": 0,
//             "ExpenseClearingAct": null,
//             "PurchaseCreditAcc": null,
//             "EUPurchaseCreditAcc": null,
//             "ForeignPurchaseCreditAcc": null,
//             "SalesCreditAcc": null,
//             "SalesCreditEUAcc": null,
//             "ExemptedCredits": null,
//             "SalesCreditForeignAcc": null,
//             "ExpenseOffsettingAccount": null,
//             "WipAccount": null,
//             "ExchangeRateDifferencesAcct": null,
//             "GoodsClearingAcct": null,
//             "NegativeInventoryAdjustmentAccount": null,
//             "CostInflationOffsetAccount": null,
//             "GLDecreaseAcct": null,
//             "GLIncreaseAcct": null,
//             "PAReturnAcct": null,
//             "PurchaseAcct": null,
//             "PurchaseOffsetAcct": null,
//             "ShippedGoodsAccount": null,
//             "StockInflationOffsetAccount": null,
//             "StockInflationAdjustAccount": null,
//             "VATInRevenueAccount": null,
//             "WipVarianceAccount": null,
//             "CostInflationAccount": null,
//             "WHIncomingCenvatAccount": null,
//             "WHOutgoingCenvatAccount": null,
//             "StockInTransitAccount": null,
//             "WipOffsetProfitAndLossAccount": null,
//             "InventoryOffsetProfitAndLossAccount": null,
//             "DefaultBin": null,
//             "DefaultBinEnforced": "tNO",
//             "PurchaseBalanceAccount": null,
//             "ItemCode": "PLPID-0006",
//             "IndEscala": "tYES",
//             "CNJPMan": null,
//             "ItemCycleCounts": []
//         },
//         {
//             "MinimalStock": 0,
//             "MaximalStock": 0,
//             "MinimalOrder": 0,
//             "StandardAveragePrice": 0,
//             "Locked": "tNO",
//             "InventoryAccount": null,
//             "CostAccount": null,
//             "TransferAccount": null,
//             "RevenuesAccount": null,
//             "VarienceAccount": null,
//             "DecreasingAccount": null,
//             "IncreasingAccount": null,
//             "ReturningAccount": null,
//             "ExpensesAccount": null,
//             "EURevenuesAccount": null,
//             "EUExpensesAccount": null,
//             "ForeignRevenueAcc": null,
//             "ForeignExpensAcc": null,
//             "ExemptIncomeAcc": null,
//             "PriceDifferenceAcc": null,
//             "WarehouseCode": "WRJ",
//             "InStock": 0,
//             "Committed": 0,
//             "Ordered": 0,
//             "CountedQuantity": 0,
//             "WasCounted": "tNO",
//             "UserSignature": 20,
//             "Counted": 0,
//             "ExpenseClearingAct": null,
//             "PurchaseCreditAcc": null,
//             "EUPurchaseCreditAcc": null,
//             "ForeignPurchaseCreditAcc": null,
//             "SalesCreditAcc": null,
//             "SalesCreditEUAcc": null,
//             "ExemptedCredits": null,
//             "SalesCreditForeignAcc": null,
//             "ExpenseOffsettingAccount": null,
//             "WipAccount": null,
//             "ExchangeRateDifferencesAcct": null,
//             "GoodsClearingAcct": null,
//             "NegativeInventoryAdjustmentAccount": null,
//             "CostInflationOffsetAccount": null,
//             "GLDecreaseAcct": null,
//             "GLIncreaseAcct": null,
//             "PAReturnAcct": null,
//             "PurchaseAcct": null,
//             "PurchaseOffsetAcct": null,
//             "ShippedGoodsAccount": null,
//             "StockInflationOffsetAccount": null,
//             "StockInflationAdjustAccount": null,
//             "VATInRevenueAccount": null,
//             "WipVarianceAccount": null,
//             "CostInflationAccount": null,
//             "WHIncomingCenvatAccount": null,
//             "WHOutgoingCenvatAccount": null,
//             "StockInTransitAccount": null,
//             "WipOffsetProfitAndLossAccount": null,
//             "InventoryOffsetProfitAndLossAccount": null,
//             "DefaultBin": null,
//             "DefaultBinEnforced": "tNO",
//             "PurchaseBalanceAccount": null,
//             "ItemCode": "PLPID-0006",
//             "IndEscala": "tYES",
//             "CNJPMan": null,
//             "ItemCycleCounts": []
//         },
//         {
//             "MinimalStock": 0,
//             "MaximalStock": 0,
//             "MinimalOrder": 0,
//             "StandardAveragePrice": 0,
//             "Locked": "tNO",
//             "InventoryAccount": null,
//             "CostAccount": null,
//             "TransferAccount": null,
//             "RevenuesAccount": null,
//             "VarienceAccount": null,
//             "DecreasingAccount": null,
//             "IncreasingAccount": null,
//             "ReturningAccount": null,
//             "ExpensesAccount": null,
//             "EURevenuesAccount": null,
//             "EUExpensesAccount": null,
//             "ForeignRevenueAcc": null,
//             "ForeignExpensAcc": null,
//             "ExemptIncomeAcc": null,
//             "PriceDifferenceAcc": null,
//             "WarehouseCode": "WRT",
//             "InStock": 0,
//             "Committed": 0,
//             "Ordered": 0,
//             "CountedQuantity": 0,
//             "WasCounted": "tNO",
//             "UserSignature": 20,
//             "Counted": 0,
//             "ExpenseClearingAct": null,
//             "PurchaseCreditAcc": null,
//             "EUPurchaseCreditAcc": null,
//             "ForeignPurchaseCreditAcc": null,
//             "SalesCreditAcc": null,
//             "SalesCreditEUAcc": null,
//             "ExemptedCredits": null,
//             "SalesCreditForeignAcc": null,
//             "ExpenseOffsettingAccount": null,
//             "WipAccount": null,
//             "ExchangeRateDifferencesAcct": null,
//             "GoodsClearingAcct": null,
//             "NegativeInventoryAdjustmentAccount": null,
//             "CostInflationOffsetAccount": null,
//             "GLDecreaseAcct": null,
//             "GLIncreaseAcct": null,
//             "PAReturnAcct": null,
//             "PurchaseAcct": null,
//             "PurchaseOffsetAcct": null,
//             "ShippedGoodsAccount": null,
//             "StockInflationOffsetAccount": null,
//             "StockInflationAdjustAccount": null,
//             "VATInRevenueAccount": null,
//             "WipVarianceAccount": null,
//             "CostInflationAccount": null,
//             "WHIncomingCenvatAccount": null,
//             "WHOutgoingCenvatAccount": null,
//             "StockInTransitAccount": null,
//             "WipOffsetProfitAndLossAccount": null,
//             "InventoryOffsetProfitAndLossAccount": null,
//             "DefaultBin": null,
//             "DefaultBinEnforced": "tNO",
//             "PurchaseBalanceAccount": null,
//             "ItemCode": "PLPID-0006",
//             "IndEscala": "tYES",
//             "CNJPMan": null,
//             "ItemCycleCounts": []
//         },
//         {
//             "MinimalStock": 0,
//             "MaximalStock": 0,
//             "MinimalOrder": 0,
//             "StandardAveragePrice": 0,
//             "Locked": "tNO",
//             "InventoryAccount": null,
//             "CostAccount": null,
//             "TransferAccount": null,
//             "RevenuesAccount": null,
//             "VarienceAccount": null,
//             "DecreasingAccount": null,
//             "IncreasingAccount": null,
//             "ReturningAccount": null,
//             "ExpensesAccount": null,
//             "EURevenuesAccount": null,
//             "EUExpensesAccount": null,
//             "ForeignRevenueAcc": null,
//             "ForeignExpensAcc": null,
//             "ExemptIncomeAcc": null,
//             "PriceDifferenceAcc": null,
//             "WarehouseCode": "WRV",
//             "InStock": 0,
//             "Committed": 0,
//             "Ordered": 0,
//             "CountedQuantity": 0,
//             "WasCounted": "tNO",
//             "UserSignature": 20,
//             "Counted": 0,
//             "ExpenseClearingAct": null,
//             "PurchaseCreditAcc": null,
//             "EUPurchaseCreditAcc": null,
//             "ForeignPurchaseCreditAcc": null,
//             "SalesCreditAcc": null,
//             "SalesCreditEUAcc": null,
//             "ExemptedCredits": null,
//             "SalesCreditForeignAcc": null,
//             "ExpenseOffsettingAccount": null,
//             "WipAccount": null,
//             "ExchangeRateDifferencesAcct": null,
//             "GoodsClearingAcct": null,
//             "NegativeInventoryAdjustmentAccount": null,
//             "CostInflationOffsetAccount": null,
//             "GLDecreaseAcct": null,
//             "GLIncreaseAcct": null,
//             "PAReturnAcct": null,
//             "PurchaseAcct": null,
//             "PurchaseOffsetAcct": null,
//             "ShippedGoodsAccount": null,
//             "StockInflationOffsetAccount": null,
//             "StockInflationAdjustAccount": null,
//             "VATInRevenueAccount": null,
//             "WipVarianceAccount": null,
//             "CostInflationAccount": null,
//             "WHIncomingCenvatAccount": null,
//             "WHOutgoingCenvatAccount": null,
//             "StockInTransitAccount": null,
//             "WipOffsetProfitAndLossAccount": null,
//             "InventoryOffsetProfitAndLossAccount": null,
//             "DefaultBin": null,
//             "DefaultBinEnforced": "tNO",
//             "PurchaseBalanceAccount": null,
//             "ItemCode": "PLPID-0006",
//             "IndEscala": "tYES",
//             "CNJPMan": null,
//             "ItemCycleCounts": []
//         },
//         {
//             "MinimalStock": 0,
//             "MaximalStock": 0,
//             "MinimalOrder": 0,
//             "StandardAveragePrice": 0,
//             "Locked": "tNO",
//             "InventoryAccount": null,
//             "CostAccount": null,
//             "TransferAccount": null,
//             "RevenuesAccount": null,
//             "VarienceAccount": null,
//             "DecreasingAccount": null,
//             "IncreasingAccount": null,
//             "ReturningAccount": null,
//             "ExpensesAccount": null,
//             "EURevenuesAccount": null,
//             "EUExpensesAccount": null,
//             "ForeignRevenueAcc": null,
//             "ForeignExpensAcc": null,
//             "ExemptIncomeAcc": null,
//             "PriceDifferenceAcc": null,
//             "WarehouseCode": "WS1",
//             "InStock": 0,
//             "Committed": 0,
//             "Ordered": 0,
//             "CountedQuantity": 0,
//             "WasCounted": "tNO",
//             "UserSignature": 20,
//             "Counted": 0,
//             "ExpenseClearingAct": null,
//             "PurchaseCreditAcc": null,
//             "EUPurchaseCreditAcc": null,
//             "ForeignPurchaseCreditAcc": null,
//             "SalesCreditAcc": null,
//             "SalesCreditEUAcc": null,
//             "ExemptedCredits": null,
//             "SalesCreditForeignAcc": null,
//             "ExpenseOffsettingAccount": null,
//             "WipAccount": null,
//             "ExchangeRateDifferencesAcct": null,
//             "GoodsClearingAcct": null,
//             "NegativeInventoryAdjustmentAccount": null,
//             "CostInflationOffsetAccount": null,
//             "GLDecreaseAcct": null,
//             "GLIncreaseAcct": null,
//             "PAReturnAcct": null,
//             "PurchaseAcct": null,
//             "PurchaseOffsetAcct": null,
//             "ShippedGoodsAccount": null,
//             "StockInflationOffsetAccount": null,
//             "StockInflationAdjustAccount": null,
//             "VATInRevenueAccount": null,
//             "WipVarianceAccount": null,
//             "CostInflationAccount": null,
//             "WHIncomingCenvatAccount": null,
//             "WHOutgoingCenvatAccount": null,
//             "StockInTransitAccount": null,
//             "WipOffsetProfitAndLossAccount": null,
//             "InventoryOffsetProfitAndLossAccount": null,
//             "DefaultBin": null,
//             "DefaultBinEnforced": "tNO",
//             "PurchaseBalanceAccount": null,
//             "ItemCode": "PLPID-0006",
//             "IndEscala": "tYES",
//             "CNJPMan": null,
//             "ItemCycleCounts": []
//         },
//         {
//             "MinimalStock": 0,
//             "MaximalStock": 0,
//             "MinimalOrder": 0,
//             "StandardAveragePrice": 0,
//             "Locked": "tNO",
//             "InventoryAccount": null,
//             "CostAccount": null,
//             "TransferAccount": null,
//             "RevenuesAccount": null,
//             "VarienceAccount": null,
//             "DecreasingAccount": null,
//             "IncreasingAccount": null,
//             "ReturningAccount": null,
//             "ExpensesAccount": null,
//             "EURevenuesAccount": null,
//             "EUExpensesAccount": null,
//             "ForeignRevenueAcc": null,
//             "ForeignExpensAcc": null,
//             "ExemptIncomeAcc": null,
//             "PriceDifferenceAcc": null,
//             "WarehouseCode": "WS2",
//             "InStock": 0,
//             "Committed": 0,
//             "Ordered": 0,
//             "CountedQuantity": 0,
//             "WasCounted": "tNO",
//             "UserSignature": 20,
//             "Counted": 0,
//             "ExpenseClearingAct": null,
//             "PurchaseCreditAcc": null,
//             "EUPurchaseCreditAcc": null,
//             "ForeignPurchaseCreditAcc": null,
//             "SalesCreditAcc": null,
//             "SalesCreditEUAcc": null,
//             "ExemptedCredits": null,
//             "SalesCreditForeignAcc": null,
//             "ExpenseOffsettingAccount": null,
//             "WipAccount": null,
//             "ExchangeRateDifferencesAcct": null,
//             "GoodsClearingAcct": null,
//             "NegativeInventoryAdjustmentAccount": null,
//             "CostInflationOffsetAccount": null,
//             "GLDecreaseAcct": null,
//             "GLIncreaseAcct": null,
//             "PAReturnAcct": null,
//             "PurchaseAcct": null,
//             "PurchaseOffsetAcct": null,
//             "ShippedGoodsAccount": null,
//             "StockInflationOffsetAccount": null,
//             "StockInflationAdjustAccount": null,
//             "VATInRevenueAccount": null,
//             "WipVarianceAccount": null,
//             "CostInflationAccount": null,
//             "WHIncomingCenvatAccount": null,
//             "WHOutgoingCenvatAccount": null,
//             "StockInTransitAccount": null,
//             "WipOffsetProfitAndLossAccount": null,
//             "InventoryOffsetProfitAndLossAccount": null,
//             "DefaultBin": null,
//             "DefaultBinEnforced": "tNO",
//             "PurchaseBalanceAccount": null,
//             "ItemCode": "PLPID-0006",
//             "IndEscala": "tYES",
//             "CNJPMan": null,
//             "ItemCycleCounts": []
//         },
//         {
//             "MinimalStock": 0,
//             "MaximalStock": 0,
//             "MinimalOrder": 0,
//             "StandardAveragePrice": 0,
//             "Locked": "tNO",
//             "InventoryAccount": null,
//             "CostAccount": null,
//             "TransferAccount": null,
//             "RevenuesAccount": null,
//             "VarienceAccount": null,
//             "DecreasingAccount": null,
//             "IncreasingAccount": null,
//             "ReturningAccount": null,
//             "ExpensesAccount": null,
//             "EURevenuesAccount": null,
//             "EUExpensesAccount": null,
//             "ForeignRevenueAcc": null,
//             "ForeignExpensAcc": null,
//             "ExemptIncomeAcc": null,
//             "PriceDifferenceAcc": null,
//             "WarehouseCode": "WSE",
//             "InStock": 0,
//             "Committed": 0,
//             "Ordered": 0,
//             "CountedQuantity": 0,
//             "WasCounted": "tNO",
//             "UserSignature": 20,
//             "Counted": 0,
//             "ExpenseClearingAct": null,
//             "PurchaseCreditAcc": null,
//             "EUPurchaseCreditAcc": null,
//             "ForeignPurchaseCreditAcc": null,
//             "SalesCreditAcc": null,
//             "SalesCreditEUAcc": null,
//             "ExemptedCredits": null,
//             "SalesCreditForeignAcc": null,
//             "ExpenseOffsettingAccount": null,
//             "WipAccount": null,
//             "ExchangeRateDifferencesAcct": null,
//             "GoodsClearingAcct": null,
//             "NegativeInventoryAdjustmentAccount": null,
//             "CostInflationOffsetAccount": null,
//             "GLDecreaseAcct": null,
//             "GLIncreaseAcct": null,
//             "PAReturnAcct": null,
//             "PurchaseAcct": null,
//             "PurchaseOffsetAcct": null,
//             "ShippedGoodsAccount": null,
//             "StockInflationOffsetAccount": null,
//             "StockInflationAdjustAccount": null,
//             "VATInRevenueAccount": null,
//             "WipVarianceAccount": null,
//             "CostInflationAccount": null,
//             "WHIncomingCenvatAccount": null,
//             "WHOutgoingCenvatAccount": null,
//             "StockInTransitAccount": null,
//             "WipOffsetProfitAndLossAccount": null,
//             "InventoryOffsetProfitAndLossAccount": null,
//             "DefaultBin": null,
//             "DefaultBinEnforced": "tNO",
//             "PurchaseBalanceAccount": null,
//             "ItemCode": "PLPID-0006",
//             "IndEscala": "tYES",
//             "CNJPMan": null,
//             "ItemCycleCounts": []
//         },
//         {
//             "MinimalStock": 0,
//             "MaximalStock": 0,
//             "MinimalOrder": 0,
//             "StandardAveragePrice": 0,
//             "Locked": "tNO",
//             "InventoryAccount": null,
//             "CostAccount": null,
//             "TransferAccount": null,
//             "RevenuesAccount": null,
//             "VarienceAccount": null,
//             "DecreasingAccount": null,
//             "IncreasingAccount": null,
//             "ReturningAccount": null,
//             "ExpensesAccount": null,
//             "EURevenuesAccount": null,
//             "EUExpensesAccount": null,
//             "ForeignRevenueAcc": null,
//             "ForeignExpensAcc": null,
//             "ExemptIncomeAcc": null,
//             "PriceDifferenceAcc": null,
//             "WarehouseCode": "WSP",
//             "InStock": 0,
//             "Committed": 0,
//             "Ordered": 0,
//             "CountedQuantity": 0,
//             "WasCounted": "tNO",
//             "UserSignature": 20,
//             "Counted": 0,
//             "ExpenseClearingAct": null,
//             "PurchaseCreditAcc": null,
//             "EUPurchaseCreditAcc": null,
//             "ForeignPurchaseCreditAcc": null,
//             "SalesCreditAcc": null,
//             "SalesCreditEUAcc": null,
//             "ExemptedCredits": null,
//             "SalesCreditForeignAcc": null,
//             "ExpenseOffsettingAccount": null,
//             "WipAccount": null,
//             "ExchangeRateDifferencesAcct": null,
//             "GoodsClearingAcct": null,
//             "NegativeInventoryAdjustmentAccount": null,
//             "CostInflationOffsetAccount": null,
//             "GLDecreaseAcct": null,
//             "GLIncreaseAcct": null,
//             "PAReturnAcct": null,
//             "PurchaseAcct": null,
//             "PurchaseOffsetAcct": null,
//             "ShippedGoodsAccount": null,
//             "StockInflationOffsetAccount": null,
//             "StockInflationAdjustAccount": null,
//             "VATInRevenueAccount": null,
//             "WipVarianceAccount": null,
//             "CostInflationAccount": null,
//             "WHIncomingCenvatAccount": null,
//             "WHOutgoingCenvatAccount": null,
//             "StockInTransitAccount": null,
//             "WipOffsetProfitAndLossAccount": null,
//             "InventoryOffsetProfitAndLossAccount": null,
//             "DefaultBin": null,
//             "DefaultBinEnforced": "tNO",
//             "PurchaseBalanceAccount": null,
//             "ItemCode": "PLPID-0006",
//             "IndEscala": "tYES",
//             "CNJPMan": null,
//             "ItemCycleCounts": []
//         }
//     ],
//     "ItemPreferredVendors": [],
//     "ItemLocalizationInfos": [],
//     "ItemProjects": [],
//     "ItemDistributionRules": [],
//     "ItemAttributeGroups": [],
//     "ItemDepreciationParameters": [],
//     "ItemPeriodControls": [],
//     "ItemUnitOfMeasurementCollection": [],
//     "ItemBarCodeCollection": [],
//     "ItemIntrastatExtension": {
//         "ItemCode": "PLPID-0006",
//         "CommodityCode": null,
//         "SupplementaryUnit": null,
//         "FactorOfSupplementaryUnit": 0,
//         "ImportRegionState": null,
//         "ExportRegionState": null,
//         "ImportNatureOfTransaction": null,
//         "ExportNatureOfTransaction": null,
//         "ImportStatisticalProcedure": null,
//         "ExportStatisticalProcedure": null,
//         "CountryOfOrigin": null,
//         "ServiceCode": null,
//         "Type": "dDocument_Items",
//         "ServiceSupplyMethod": "ssmImmediate",
//         "ServicePaymentMethod": "spmOther",
//         "ImportRegionCountry": null,
//         "ExportRegionCountry": null,
//         "UseWeightInCalculation": "tYES",
//         "IntrastatRelevant": "tNO",
//         "StatisticalCode": null
//     }
// }

});

// BinLocations
app.post("/api/binlocations", async (req, res) => {
  console.log("req.body:", req.body);
  const getBinLocationBaseURL = `https://192.168.0.44:50000/b1s/v1/BinLocations?$select=AbsEntry,BinCode,Warehouse&$filter=Warehouse eq '${req.body.WarehouseCode}'`;
  console.log(getBinLocationBaseURL);
  console.log("sessionObj.sessionId: " + sessionObj.sessionId);
  try {
    const response = await axios.get(getBinLocationBaseURL, {
      withCredentials: true,
      headers: {
        Cookie: sessionObj.sessionId,
        Prefer: "odata.maxpagesize=9999999999",
      },
    });
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
            "AbsEntry": 2397,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-0-33LOAD"
        },
        {
            "AbsEntry": 2407,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-0-59GMP"
        },
        {
            "AbsEntry": 2393,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-0-59LOAD"
        },
        {
            "AbsEntry": 2194,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-0A00-0"
        },
        {
            "AbsEntry": 2408,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-0-CAR"
        },
        {
            "AbsEntry": 1196,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A01-1"
        },
        {
            "AbsEntry": 1197,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A01-2"
        },
        {
            "AbsEntry": 1198,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A01-3"
        },
        {
            "AbsEntry": 1199,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A01-4"
        },
        {
            "AbsEntry": 1200,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A02-1"
        },
        {
            "AbsEntry": 1201,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A02-2"
        },
        {
            "AbsEntry": 1202,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A02-3"
        },
        {
            "AbsEntry": 1203,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A02-4"
        },
        {
            "AbsEntry": 1204,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A03-1"
        },
        {
            "AbsEntry": 1205,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A03-2"
        },
        {
            "AbsEntry": 1206,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A03-3"
        },
        {
            "AbsEntry": 1207,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A03-4"
        },
        {
            "AbsEntry": 1208,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A04-1"
        },
        {
            "AbsEntry": 1209,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A04-2"
        },
        {
            "AbsEntry": 1210,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A04-3"
        },
        {
            "AbsEntry": 1211,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A04-4"
        },
        {
            "AbsEntry": 1212,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A05-1"
        },
        {
            "AbsEntry": 1213,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A05-2"
        },
        {
            "AbsEntry": 1214,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A05-3"
        },
        {
            "AbsEntry": 1215,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A05-4"
        },
        {
            "AbsEntry": 2212,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A05-5"
        },
        {
            "AbsEntry": 2213,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A05-6"
        },
        {
            "AbsEntry": 2214,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A05-7"
        },
        {
            "AbsEntry": 1220,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A07-1"
        },
        {
            "AbsEntry": 1221,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A07-2"
        },
        {
            "AbsEntry": 1222,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A07-3"
        },
        {
            "AbsEntry": 1223,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A07-4"
        },
        {
            "AbsEntry": 1224,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A08-1"
        },
        {
            "AbsEntry": 1225,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A08-2"
        },
        {
            "AbsEntry": 1226,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A08-3"
        },
        {
            "AbsEntry": 1227,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A08-4"
        },
        {
            "AbsEntry": 1228,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A09-1"
        },
        {
            "AbsEntry": 1229,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A09-2"
        },
        {
            "AbsEntry": 1230,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A09-3"
        },
        {
            "AbsEntry": 1231,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A09-4"
        },
        {
            "AbsEntry": 1232,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A10-1"
        },
        {
            "AbsEntry": 1233,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A10-2"
        },
        {
            "AbsEntry": 1234,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A10-3"
        },
        {
            "AbsEntry": 1235,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A10-4"
        },
        {
            "AbsEntry": 1236,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A11-1"
        },
        {
            "AbsEntry": 1237,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A11-2"
        },
        {
            "AbsEntry": 1238,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A11-3"
        },
        {
            "AbsEntry": 1239,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A11-4"
        },
        {
            "AbsEntry": 1240,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A12-1"
        },
        {
            "AbsEntry": 1241,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A12-2"
        },
        {
            "AbsEntry": 1242,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A12-3"
        },
        {
            "AbsEntry": 1243,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A12-4"
        },
        {
            "AbsEntry": 1244,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A13-1"
        },
        {
            "AbsEntry": 1245,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A13-2"
        },
        {
            "AbsEntry": 1246,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A13-3"
        },
        {
            "AbsEntry": 1247,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A13-4"
        },
        {
            "AbsEntry": 1248,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A14-1"
        },
        {
            "AbsEntry": 1249,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A14-2"
        },
        {
            "AbsEntry": 1250,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A14-3"
        },
        {
            "AbsEntry": 1251,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A14-4"
        },
        {
            "AbsEntry": 1252,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A15-1"
        },
        {
            "AbsEntry": 1253,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A15-2"
        },
        {
            "AbsEntry": 1254,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A15-3"
        },
        {
            "AbsEntry": 1255,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A15-4"
        },
        {
            "AbsEntry": 1256,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A16-1"
        },
        {
            "AbsEntry": 1257,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A16-2"
        },
        {
            "AbsEntry": 1258,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A16-3"
        },
        {
            "AbsEntry": 1259,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A16-4"
        },
        {
            "AbsEntry": 1260,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A17-1"
        },
        {
            "AbsEntry": 1261,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A17-2"
        },
        {
            "AbsEntry": 1262,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A17-3"
        },
        {
            "AbsEntry": 1263,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A17-4"
        },
        {
            "AbsEntry": 1264,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A18-1"
        },
        {
            "AbsEntry": 1265,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A18-2"
        },
        {
            "AbsEntry": 1266,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A18-3"
        },
        {
            "AbsEntry": 1267,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A18-4"
        },
        {
            "AbsEntry": 1268,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A19-1"
        },
        {
            "AbsEntry": 1269,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A19-2"
        },
        {
            "AbsEntry": 1270,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A19-3"
        },
        {
            "AbsEntry": 1271,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A19-4"
        },
        {
            "AbsEntry": 1272,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A20-1"
        },
        {
            "AbsEntry": 1273,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A20-2"
        },
        {
            "AbsEntry": 1274,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A20-3"
        },
        {
            "AbsEntry": 1275,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A20-4"
        },
        {
            "AbsEntry": 1276,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A21-1"
        },
        {
            "AbsEntry": 1277,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A21-2"
        },
        {
            "AbsEntry": 1278,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A21-3"
        },
        {
            "AbsEntry": 1279,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A21-4"
        },
        {
            "AbsEntry": 1280,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A22-1"
        },
        {
            "AbsEntry": 1281,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A22-2"
        },
        {
            "AbsEntry": 1282,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A22-3"
        },
        {
            "AbsEntry": 1283,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A22-4"
        },
        {
            "AbsEntry": 1284,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A23-1"
        },
        {
            "AbsEntry": 1285,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A23-2"
        },
        {
            "AbsEntry": 1286,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A23-3"
        },
        {
            "AbsEntry": 1287,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A23-4"
        },
        {
            "AbsEntry": 1288,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A24-1"
        },
        {
            "AbsEntry": 1289,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A24-2"
        },
        {
            "AbsEntry": 1290,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A24-3"
        },
        {
            "AbsEntry": 1291,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1A24-4"
        },
        {
            "AbsEntry": 1292,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B01-1"
        },
        {
            "AbsEntry": 1293,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B01-2"
        },
        {
            "AbsEntry": 1294,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B01-3"
        },
        {
            "AbsEntry": 1295,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B01-4"
        },
        {
            "AbsEntry": 1296,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B02-1"
        },
        {
            "AbsEntry": 1297,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B02-2"
        },
        {
            "AbsEntry": 1298,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B02-3"
        },
        {
            "AbsEntry": 1299,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B02-4"
        },
        {
            "AbsEntry": 1300,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B03-1"
        },
        {
            "AbsEntry": 1301,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B03-2"
        },
        {
            "AbsEntry": 1302,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B03-3"
        },
        {
            "AbsEntry": 1303,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B03-4"
        },
        {
            "AbsEntry": 1304,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B04-1"
        },
        {
            "AbsEntry": 1305,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B04-2"
        },
        {
            "AbsEntry": 1306,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B04-3"
        },
        {
            "AbsEntry": 1307,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B04-4"
        },
        {
            "AbsEntry": 1308,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B05-1"
        },
        {
            "AbsEntry": 1309,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B05-2"
        },
        {
            "AbsEntry": 1310,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B05-3"
        },
        {
            "AbsEntry": 1311,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B05-4"
        },
        {
            "AbsEntry": 1312,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B06-1"
        },
        {
            "AbsEntry": 1313,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B06-2"
        },
        {
            "AbsEntry": 1314,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B06-3"
        },
        {
            "AbsEntry": 1315,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B06-4"
        },
        {
            "AbsEntry": 1316,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B07-1"
        },
        {
            "AbsEntry": 1317,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B07-2"
        },
        {
            "AbsEntry": 1318,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B07-3"
        },
        {
            "AbsEntry": 1319,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B07-4"
        },
        {
            "AbsEntry": 1320,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B08-1"
        },
        {
            "AbsEntry": 1321,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B08-2"
        },
        {
            "AbsEntry": 1322,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B08-3"
        },
        {
            "AbsEntry": 1323,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B08-4"
        },
        {
            "AbsEntry": 1324,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B09-1"
        },
        {
            "AbsEntry": 1325,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B09-2"
        },
        {
            "AbsEntry": 1326,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B09-3"
        },
        {
            "AbsEntry": 1327,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B09-4"
        },
        {
            "AbsEntry": 1328,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B10-1"
        },
        {
            "AbsEntry": 1329,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B10-2"
        },
        {
            "AbsEntry": 1330,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B10-3"
        },
        {
            "AbsEntry": 1331,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B10-4"
        },
        {
            "AbsEntry": 1332,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B11-1"
        },
        {
            "AbsEntry": 1333,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B11-2"
        },
        {
            "AbsEntry": 1334,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B11-3"
        },
        {
            "AbsEntry": 1335,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B11-4"
        },
        {
            "AbsEntry": 1336,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B12-1"
        },
        {
            "AbsEntry": 1337,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B12-2"
        },
        {
            "AbsEntry": 1338,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B12-3"
        },
        {
            "AbsEntry": 1339,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B12-4"
        },
        {
            "AbsEntry": 1340,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B13-1"
        },
        {
            "AbsEntry": 1341,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B13-2"
        },
        {
            "AbsEntry": 1342,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B13-3"
        },
        {
            "AbsEntry": 1343,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B13-4"
        },
        {
            "AbsEntry": 1344,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B14-1"
        },
        {
            "AbsEntry": 1345,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B14-2"
        },
        {
            "AbsEntry": 1346,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B14-3"
        },
        {
            "AbsEntry": 1347,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B14-4"
        },
        {
            "AbsEntry": 1348,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B15-1"
        },
        {
            "AbsEntry": 1349,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B15-2"
        },
        {
            "AbsEntry": 1350,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B15-3"
        },
        {
            "AbsEntry": 1351,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B15-4"
        },
        {
            "AbsEntry": 1352,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B16-1"
        },
        {
            "AbsEntry": 1353,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B16-2"
        },
        {
            "AbsEntry": 1354,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B16-3"
        },
        {
            "AbsEntry": 1355,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B16-4"
        },
        {
            "AbsEntry": 1356,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B17-1"
        },
        {
            "AbsEntry": 1357,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B17-2"
        },
        {
            "AbsEntry": 1358,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B17-3"
        },
        {
            "AbsEntry": 1359,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B17-4"
        },
        {
            "AbsEntry": 1360,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B18-1"
        },
        {
            "AbsEntry": 1361,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B18-2"
        },
        {
            "AbsEntry": 1362,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B18-3"
        },
        {
            "AbsEntry": 1363,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B18-4"
        },
        {
            "AbsEntry": 1364,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B19-1"
        },
        {
            "AbsEntry": 1365,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B19-2"
        },
        {
            "AbsEntry": 1366,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B19-3"
        },
        {
            "AbsEntry": 1367,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B19-4"
        },
        {
            "AbsEntry": 1368,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B20-1"
        },
        {
            "AbsEntry": 1369,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B20-2"
        },
        {
            "AbsEntry": 1370,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B20-3"
        },
        {
            "AbsEntry": 1371,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1B20-4"
        },
        {
            "AbsEntry": 1372,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C01-1"
        },
        {
            "AbsEntry": 1373,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C01-2"
        },
        {
            "AbsEntry": 1374,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C01-3"
        },
        {
            "AbsEntry": 1375,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C01-4"
        },
        {
            "AbsEntry": 1376,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C01-5"
        },
        {
            "AbsEntry": 1377,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C02-1"
        },
        {
            "AbsEntry": 1378,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C02-2"
        },
        {
            "AbsEntry": 1379,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C02-3"
        },
        {
            "AbsEntry": 1380,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C02-4"
        },
        {
            "AbsEntry": 1381,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C02-5"
        },
        {
            "AbsEntry": 1382,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C03-1"
        },
        {
            "AbsEntry": 1383,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C03-2"
        },
        {
            "AbsEntry": 1384,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C03-3"
        },
        {
            "AbsEntry": 1385,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C03-4"
        },
        {
            "AbsEntry": 1386,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C03-5"
        },
        {
            "AbsEntry": 1387,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C04-1"
        },
        {
            "AbsEntry": 1388,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C04-2"
        },
        {
            "AbsEntry": 1389,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C04-3"
        },
        {
            "AbsEntry": 1390,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C04-4"
        },
        {
            "AbsEntry": 1391,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C04-5"
        },
        {
            "AbsEntry": 1392,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C05-1"
        },
        {
            "AbsEntry": 1393,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C05-2"
        },
        {
            "AbsEntry": 1394,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C05-3"
        },
        {
            "AbsEntry": 1395,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C05-4"
        },
        {
            "AbsEntry": 1396,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C05-5"
        },
        {
            "AbsEntry": 1397,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C06-1"
        },
        {
            "AbsEntry": 1398,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C06-2"
        },
        {
            "AbsEntry": 1399,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C06-3"
        },
        {
            "AbsEntry": 1400,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C06-4"
        },
        {
            "AbsEntry": 1401,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C06-5"
        },
        {
            "AbsEntry": 1402,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C07-1"
        },
        {
            "AbsEntry": 1403,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C07-2"
        },
        {
            "AbsEntry": 1404,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C07-3"
        },
        {
            "AbsEntry": 1405,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C07-4"
        },
        {
            "AbsEntry": 1406,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C07-5"
        },
        {
            "AbsEntry": 1407,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C08-1"
        },
        {
            "AbsEntry": 1408,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C08-2"
        },
        {
            "AbsEntry": 1409,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C08-3"
        },
        {
            "AbsEntry": 1410,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C08-4"
        },
        {
            "AbsEntry": 1411,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C08-5"
        },
        {
            "AbsEntry": 1412,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C09-1"
        },
        {
            "AbsEntry": 1413,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C09-2"
        },
        {
            "AbsEntry": 1414,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C09-3"
        },
        {
            "AbsEntry": 1415,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C09-4"
        },
        {
            "AbsEntry": 1416,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C09-5"
        },
        {
            "AbsEntry": 1417,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C10-1"
        },
        {
            "AbsEntry": 1418,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C10-2"
        },
        {
            "AbsEntry": 1419,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C10-3"
        },
        {
            "AbsEntry": 1420,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C10-4"
        },
        {
            "AbsEntry": 1421,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C10-5"
        },
        {
            "AbsEntry": 1422,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C11-1"
        },
        {
            "AbsEntry": 1423,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C11-2"
        },
        {
            "AbsEntry": 1424,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C11-3"
        },
        {
            "AbsEntry": 1425,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C11-4"
        },
        {
            "AbsEntry": 1426,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C11-5"
        },
        {
            "AbsEntry": 1427,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C12-1"
        },
        {
            "AbsEntry": 1428,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C12-2"
        },
        {
            "AbsEntry": 1429,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C12-3"
        },
        {
            "AbsEntry": 1430,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C12-4"
        },
        {
            "AbsEntry": 1431,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C12-5"
        },
        {
            "AbsEntry": 1432,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C13-1"
        },
        {
            "AbsEntry": 1433,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C13-2"
        },
        {
            "AbsEntry": 1434,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C13-3"
        },
        {
            "AbsEntry": 1435,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C13-4"
        },
        {
            "AbsEntry": 1436,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C13-5"
        },
        {
            "AbsEntry": 1437,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C14-1"
        },
        {
            "AbsEntry": 1438,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C14-2"
        },
        {
            "AbsEntry": 1439,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C14-3"
        },
        {
            "AbsEntry": 1440,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C14-4"
        },
        {
            "AbsEntry": 1441,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C14-5"
        },
        {
            "AbsEntry": 1442,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C15-1"
        },
        {
            "AbsEntry": 1443,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C15-2"
        },
        {
            "AbsEntry": 1444,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C15-3"
        },
        {
            "AbsEntry": 1445,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C15-4"
        },
        {
            "AbsEntry": 1446,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C15-5"
        },
        {
            "AbsEntry": 1447,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C16-1"
        },
        {
            "AbsEntry": 1448,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C16-2"
        },
        {
            "AbsEntry": 1449,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C16-3"
        },
        {
            "AbsEntry": 1450,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C16-4"
        },
        {
            "AbsEntry": 1451,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C16-5"
        },
        {
            "AbsEntry": 1452,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C17-1"
        },
        {
            "AbsEntry": 1453,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C17-2"
        },
        {
            "AbsEntry": 1454,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C17-3"
        },
        {
            "AbsEntry": 1455,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C17-4"
        },
        {
            "AbsEntry": 1456,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C17-5"
        },
        {
            "AbsEntry": 1457,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C18-1"
        },
        {
            "AbsEntry": 1458,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C18-2"
        },
        {
            "AbsEntry": 1459,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C18-3"
        },
        {
            "AbsEntry": 1460,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C18-4"
        },
        {
            "AbsEntry": 1461,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C18-5"
        },
        {
            "AbsEntry": 1462,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C19-1"
        },
        {
            "AbsEntry": 1463,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C19-2"
        },
        {
            "AbsEntry": 1464,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C19-3"
        },
        {
            "AbsEntry": 1465,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C19-4"
        },
        {
            "AbsEntry": 1466,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C19-5"
        },
        {
            "AbsEntry": 1467,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C20-1"
        },
        {
            "AbsEntry": 1468,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C20-2"
        },
        {
            "AbsEntry": 1469,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C20-3"
        },
        {
            "AbsEntry": 1470,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C20-4"
        },
        {
            "AbsEntry": 1471,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1C20-5"
        },
        {
            "AbsEntry": 1472,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D01-1"
        },
        {
            "AbsEntry": 1473,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D01-2"
        },
        {
            "AbsEntry": 1474,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D01-3"
        },
        {
            "AbsEntry": 1475,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D01-4"
        },
        {
            "AbsEntry": 1476,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D01-5"
        },
        {
            "AbsEntry": 1477,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D02-1"
        },
        {
            "AbsEntry": 1478,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D02-2"
        },
        {
            "AbsEntry": 1479,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D02-3"
        },
        {
            "AbsEntry": 1480,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D02-4"
        },
        {
            "AbsEntry": 1481,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D02-5"
        },
        {
            "AbsEntry": 1482,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D03-1"
        },
        {
            "AbsEntry": 1483,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D03-2"
        },
        {
            "AbsEntry": 1484,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D03-3"
        },
        {
            "AbsEntry": 1485,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D03-4"
        },
        {
            "AbsEntry": 1486,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D03-5"
        },
        {
            "AbsEntry": 1487,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D04-1"
        },
        {
            "AbsEntry": 1488,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D04-2"
        },
        {
            "AbsEntry": 1489,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D04-3"
        },
        {
            "AbsEntry": 1490,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D04-4"
        },
        {
            "AbsEntry": 1491,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D04-5"
        },
        {
            "AbsEntry": 1492,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D05-1"
        },
        {
            "AbsEntry": 1493,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D05-2"
        },
        {
            "AbsEntry": 1494,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D05-3"
        },
        {
            "AbsEntry": 1495,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D05-4"
        },
        {
            "AbsEntry": 1496,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D05-5"
        },
        {
            "AbsEntry": 1497,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D06-1"
        },
        {
            "AbsEntry": 1498,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D06-2"
        },
        {
            "AbsEntry": 1499,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D06-3"
        },
        {
            "AbsEntry": 1500,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D06-4"
        },
        {
            "AbsEntry": 1501,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D06-5"
        },
        {
            "AbsEntry": 1502,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D07-1"
        },
        {
            "AbsEntry": 1503,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D07-2"
        },
        {
            "AbsEntry": 1504,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D07-3"
        },
        {
            "AbsEntry": 1505,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D07-4"
        },
        {
            "AbsEntry": 1506,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D07-5"
        },
        {
            "AbsEntry": 1507,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D08-1"
        },
        {
            "AbsEntry": 1508,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D08-2"
        },
        {
            "AbsEntry": 1509,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D08-3"
        },
        {
            "AbsEntry": 1510,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D08-4"
        },
        {
            "AbsEntry": 1511,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D08-5"
        },
        {
            "AbsEntry": 1512,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D09-1"
        },
        {
            "AbsEntry": 1513,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D09-2"
        },
        {
            "AbsEntry": 1514,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D09-3"
        },
        {
            "AbsEntry": 1515,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D09-4"
        },
        {
            "AbsEntry": 1516,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D09-5"
        },
        {
            "AbsEntry": 1517,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D10-1"
        },
        {
            "AbsEntry": 1518,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D10-2"
        },
        {
            "AbsEntry": 1519,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D10-3"
        },
        {
            "AbsEntry": 1520,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D10-4"
        },
        {
            "AbsEntry": 1521,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D10-5"
        },
        {
            "AbsEntry": 1522,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D11-1"
        },
        {
            "AbsEntry": 1523,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D11-2"
        },
        {
            "AbsEntry": 1524,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D11-3"
        },
        {
            "AbsEntry": 1525,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D11-4"
        },
        {
            "AbsEntry": 1526,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D11-5"
        },
        {
            "AbsEntry": 1527,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D12-1"
        },
        {
            "AbsEntry": 1528,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D12-2"
        },
        {
            "AbsEntry": 1529,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D12-3"
        },
        {
            "AbsEntry": 1530,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D12-4"
        },
        {
            "AbsEntry": 1531,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D12-5"
        },
        {
            "AbsEntry": 1532,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D13-1"
        },
        {
            "AbsEntry": 1533,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D13-2"
        },
        {
            "AbsEntry": 1534,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D13-3"
        },
        {
            "AbsEntry": 1535,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D13-4"
        },
        {
            "AbsEntry": 1536,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D13-5"
        },
        {
            "AbsEntry": 1537,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D14-1"
        },
        {
            "AbsEntry": 1538,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D14-2"
        },
        {
            "AbsEntry": 1539,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D14-3"
        },
        {
            "AbsEntry": 1540,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D14-4"
        },
        {
            "AbsEntry": 1541,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D14-5"
        },
        {
            "AbsEntry": 1542,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D15-1"
        },
        {
            "AbsEntry": 1543,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D15-2"
        },
        {
            "AbsEntry": 1544,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D15-3"
        },
        {
            "AbsEntry": 1545,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D15-4"
        },
        {
            "AbsEntry": 1546,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D15-5"
        },
        {
            "AbsEntry": 1547,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D16-1"
        },
        {
            "AbsEntry": 1548,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D16-2"
        },
        {
            "AbsEntry": 1549,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D16-3"
        },
        {
            "AbsEntry": 1550,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D16-4"
        },
        {
            "AbsEntry": 1551,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D16-5"
        },
        {
            "AbsEntry": 1552,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D17-1"
        },
        {
            "AbsEntry": 1553,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D17-2"
        },
        {
            "AbsEntry": 1554,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D17-3"
        },
        {
            "AbsEntry": 1555,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D17-4"
        },
        {
            "AbsEntry": 1556,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D17-5"
        },
        {
            "AbsEntry": 1557,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D18-1"
        },
        {
            "AbsEntry": 1558,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D18-2"
        },
        {
            "AbsEntry": 1559,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D18-3"
        },
        {
            "AbsEntry": 1560,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D18-4"
        },
        {
            "AbsEntry": 1561,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D18-5"
        },
        {
            "AbsEntry": 1562,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D19-1"
        },
        {
            "AbsEntry": 1563,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D19-2"
        },
        {
            "AbsEntry": 1564,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D19-3"
        },
        {
            "AbsEntry": 1565,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D19-4"
        },
        {
            "AbsEntry": 1566,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D19-5"
        },
        {
            "AbsEntry": 1567,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D20-1"
        },
        {
            "AbsEntry": 1568,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D20-2"
        },
        {
            "AbsEntry": 1569,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D20-3"
        },
        {
            "AbsEntry": 1570,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D20-4"
        },
        {
            "AbsEntry": 1571,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1D20-5"
        },
        {
            "AbsEntry": 1572,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E01-1"
        },
        {
            "AbsEntry": 1573,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E01-2"
        },
        {
            "AbsEntry": 1574,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E01-3"
        },
        {
            "AbsEntry": 1575,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E01-4"
        },
        {
            "AbsEntry": 1576,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E02-1"
        },
        {
            "AbsEntry": 1577,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E02-2"
        },
        {
            "AbsEntry": 1578,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E02-3"
        },
        {
            "AbsEntry": 1579,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E02-4"
        },
        {
            "AbsEntry": 1580,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E03-1"
        },
        {
            "AbsEntry": 1581,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E03-2"
        },
        {
            "AbsEntry": 1582,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E03-3"
        },
        {
            "AbsEntry": 1583,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E03-4"
        },
        {
            "AbsEntry": 1584,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E04-1"
        },
        {
            "AbsEntry": 1585,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E04-2"
        },
        {
            "AbsEntry": 1586,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E04-3"
        },
        {
            "AbsEntry": 1587,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E04-4"
        },
        {
            "AbsEntry": 1588,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E05-1"
        },
        {
            "AbsEntry": 1589,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E05-2"
        },
        {
            "AbsEntry": 1590,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E05-3"
        },
        {
            "AbsEntry": 1591,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E05-4"
        },
        {
            "AbsEntry": 1592,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E06-1"
        },
        {
            "AbsEntry": 1593,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E06-2"
        },
        {
            "AbsEntry": 1594,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E06-3"
        },
        {
            "AbsEntry": 1595,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E06-4"
        },
        {
            "AbsEntry": 1596,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E07-1"
        },
        {
            "AbsEntry": 1597,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E07-2"
        },
        {
            "AbsEntry": 1598,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E07-3"
        },
        {
            "AbsEntry": 1599,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E07-4"
        },
        {
            "AbsEntry": 1600,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E08-1"
        },
        {
            "AbsEntry": 1601,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E08-2"
        },
        {
            "AbsEntry": 1602,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E08-3"
        },
        {
            "AbsEntry": 1603,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E08-4"
        },
        {
            "AbsEntry": 1604,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E09-1"
        },
        {
            "AbsEntry": 1605,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E09-2"
        },
        {
            "AbsEntry": 1606,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E09-3"
        },
        {
            "AbsEntry": 1607,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E09-4"
        },
        {
            "AbsEntry": 1608,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E10-1"
        },
        {
            "AbsEntry": 1609,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E10-2"
        },
        {
            "AbsEntry": 1610,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E10-3"
        },
        {
            "AbsEntry": 1611,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E10-4"
        },
        {
            "AbsEntry": 1612,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E11-1"
        },
        {
            "AbsEntry": 1613,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E11-2"
        },
        {
            "AbsEntry": 1614,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E11-3"
        },
        {
            "AbsEntry": 1615,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E11-4"
        },
        {
            "AbsEntry": 1616,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E12-1"
        },
        {
            "AbsEntry": 1617,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E12-2"
        },
        {
            "AbsEntry": 1618,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E12-3"
        },
        {
            "AbsEntry": 1619,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E12-4"
        },
        {
            "AbsEntry": 1620,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E13-1"
        },
        {
            "AbsEntry": 1621,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E13-2"
        },
        {
            "AbsEntry": 1622,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E13-3"
        },
        {
            "AbsEntry": 1623,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E13-4"
        },
        {
            "AbsEntry": 2201,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E14-1"
        },
        {
            "AbsEntry": 2202,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E15-1"
        },
        {
            "AbsEntry": 2203,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E16-1"
        },
        {
            "AbsEntry": 2204,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1E17-1"
        },
        {
            "AbsEntry": 1624,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F01-1"
        },
        {
            "AbsEntry": 1625,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F01-2"
        },
        {
            "AbsEntry": 1626,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F01-3"
        },
        {
            "AbsEntry": 1627,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F01-4"
        },
        {
            "AbsEntry": 1628,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F02-1"
        },
        {
            "AbsEntry": 1629,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F02-2"
        },
        {
            "AbsEntry": 1630,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F02-3"
        },
        {
            "AbsEntry": 1631,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F02-4"
        },
        {
            "AbsEntry": 1632,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F03-1"
        },
        {
            "AbsEntry": 1633,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F03-2"
        },
        {
            "AbsEntry": 1634,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F03-3"
        },
        {
            "AbsEntry": 1635,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F03-4"
        },
        {
            "AbsEntry": 1636,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F04-1"
        },
        {
            "AbsEntry": 1637,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F04-2"
        },
        {
            "AbsEntry": 1638,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F04-3"
        },
        {
            "AbsEntry": 1639,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F04-4"
        },
        {
            "AbsEntry": 1640,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F05-1"
        },
        {
            "AbsEntry": 1641,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F05-2"
        },
        {
            "AbsEntry": 1642,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F05-3"
        },
        {
            "AbsEntry": 1643,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F05-4"
        },
        {
            "AbsEntry": 1644,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F06-1"
        },
        {
            "AbsEntry": 1645,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F06-2"
        },
        {
            "AbsEntry": 1646,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F06-3"
        },
        {
            "AbsEntry": 1647,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F06-4"
        },
        {
            "AbsEntry": 1648,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F07-1"
        },
        {
            "AbsEntry": 1649,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F07-2"
        },
        {
            "AbsEntry": 1650,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F07-3"
        },
        {
            "AbsEntry": 1651,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F07-4"
        },
        {
            "AbsEntry": 1652,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F08-1"
        },
        {
            "AbsEntry": 1653,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F08-2"
        },
        {
            "AbsEntry": 1654,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F08-3"
        },
        {
            "AbsEntry": 1655,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F08-4"
        },
        {
            "AbsEntry": 1656,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F09-1"
        },
        {
            "AbsEntry": 1657,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F09-2"
        },
        {
            "AbsEntry": 1658,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F09-3"
        },
        {
            "AbsEntry": 1659,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F09-4"
        },
        {
            "AbsEntry": 1660,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F10-1"
        },
        {
            "AbsEntry": 1661,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F10-2"
        },
        {
            "AbsEntry": 1662,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F10-3"
        },
        {
            "AbsEntry": 1663,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1F10-4"
        },
        {
            "AbsEntry": 1664,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G01-1"
        },
        {
            "AbsEntry": 1665,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G01-2"
        },
        {
            "AbsEntry": 1666,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G01-3"
        },
        {
            "AbsEntry": 1667,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G01-4"
        },
        {
            "AbsEntry": 1668,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G01-5"
        },
        {
            "AbsEntry": 1669,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G02-1"
        },
        {
            "AbsEntry": 1670,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G02-2"
        },
        {
            "AbsEntry": 1671,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G02-3"
        },
        {
            "AbsEntry": 1672,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G02-4"
        },
        {
            "AbsEntry": 1673,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G02-5"
        },
        {
            "AbsEntry": 1674,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G03-1"
        },
        {
            "AbsEntry": 1675,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G03-2"
        },
        {
            "AbsEntry": 1676,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G03-3"
        },
        {
            "AbsEntry": 1677,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G03-4"
        },
        {
            "AbsEntry": 1678,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G03-5"
        },
        {
            "AbsEntry": 1679,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G04-1"
        },
        {
            "AbsEntry": 1680,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G04-2"
        },
        {
            "AbsEntry": 1681,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G04-3"
        },
        {
            "AbsEntry": 1682,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G04-4"
        },
        {
            "AbsEntry": 1683,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G04-5"
        },
        {
            "AbsEntry": 1684,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G05-1"
        },
        {
            "AbsEntry": 1685,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G05-2"
        },
        {
            "AbsEntry": 1686,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G05-3"
        },
        {
            "AbsEntry": 1687,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G05-4"
        },
        {
            "AbsEntry": 1688,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G05-5"
        },
        {
            "AbsEntry": 1689,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G06-1"
        },
        {
            "AbsEntry": 1690,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G06-2"
        },
        {
            "AbsEntry": 1691,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G06-3"
        },
        {
            "AbsEntry": 1692,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G06-4"
        },
        {
            "AbsEntry": 1693,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G06-5"
        },
        {
            "AbsEntry": 1694,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G07-1"
        },
        {
            "AbsEntry": 1695,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G07-2"
        },
        {
            "AbsEntry": 1696,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G07-3"
        },
        {
            "AbsEntry": 1697,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G07-4"
        },
        {
            "AbsEntry": 1698,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G07-5"
        },
        {
            "AbsEntry": 1699,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G08-1"
        },
        {
            "AbsEntry": 1700,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G08-2"
        },
        {
            "AbsEntry": 1701,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G08-3"
        },
        {
            "AbsEntry": 1702,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G08-4"
        },
        {
            "AbsEntry": 1703,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1G08-5"
        },
        {
            "AbsEntry": 1704,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H01-1"
        },
        {
            "AbsEntry": 1705,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H01-2"
        },
        {
            "AbsEntry": 1706,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H02-1"
        },
        {
            "AbsEntry": 1707,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H02-2"
        },
        {
            "AbsEntry": 1708,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H03-1"
        },
        {
            "AbsEntry": 1709,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H03-2"
        },
        {
            "AbsEntry": 1710,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H04-1"
        },
        {
            "AbsEntry": 1711,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H04-2"
        },
        {
            "AbsEntry": 1712,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H05-1"
        },
        {
            "AbsEntry": 1713,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H05-2"
        },
        {
            "AbsEntry": 1714,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H06-1"
        },
        {
            "AbsEntry": 1715,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H06-2"
        },
        {
            "AbsEntry": 1716,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H07-1"
        },
        {
            "AbsEntry": 1717,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H07-2"
        },
        {
            "AbsEntry": 1718,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H08-1"
        },
        {
            "AbsEntry": 1719,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H08-2"
        },
        {
            "AbsEntry": 1720,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H09-1"
        },
        {
            "AbsEntry": 1721,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H09-2"
        },
        {
            "AbsEntry": 1722,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H10-1"
        },
        {
            "AbsEntry": 1723,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H10-2"
        },
        {
            "AbsEntry": 1724,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H11-1"
        },
        {
            "AbsEntry": 1725,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H11-2"
        },
        {
            "AbsEntry": 1726,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H12-1"
        },
        {
            "AbsEntry": 1727,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1H12-2"
        },
        {
            "AbsEntry": 1728,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I01-1"
        },
        {
            "AbsEntry": 1729,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I01-2"
        },
        {
            "AbsEntry": 1730,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I02-1"
        },
        {
            "AbsEntry": 1731,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I02-2"
        },
        {
            "AbsEntry": 1732,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I03-1"
        },
        {
            "AbsEntry": 1733,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I03-2"
        },
        {
            "AbsEntry": 1734,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I04-1"
        },
        {
            "AbsEntry": 1735,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I04-2"
        },
        {
            "AbsEntry": 1736,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I05-1"
        },
        {
            "AbsEntry": 1737,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I05-2"
        },
        {
            "AbsEntry": 1738,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I06-1"
        },
        {
            "AbsEntry": 1739,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I06-2"
        },
        {
            "AbsEntry": 1740,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I07-1"
        },
        {
            "AbsEntry": 1741,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I07-2"
        },
        {
            "AbsEntry": 1742,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I08-1"
        },
        {
            "AbsEntry": 1743,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I08-2"
        },
        {
            "AbsEntry": 1744,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I09-1"
        },
        {
            "AbsEntry": 1745,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I09-2"
        },
        {
            "AbsEntry": 1746,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I10-1"
        },
        {
            "AbsEntry": 1747,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I10-2"
        },
        {
            "AbsEntry": 1748,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I11-1"
        },
        {
            "AbsEntry": 1749,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I11-2"
        },
        {
            "AbsEntry": 1750,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I12-1"
        },
        {
            "AbsEntry": 1751,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I12-2"
        },
        {
            "AbsEntry": 1752,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I13-1"
        },
        {
            "AbsEntry": 1753,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I13-2"
        },
        {
            "AbsEntry": 1754,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I14-1"
        },
        {
            "AbsEntry": 1755,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I14-2"
        },
        {
            "AbsEntry": 1756,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I15-1"
        },
        {
            "AbsEntry": 1757,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I15-2"
        },
        {
            "AbsEntry": 1758,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I16-1"
        },
        {
            "AbsEntry": 1759,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I16-2"
        },
        {
            "AbsEntry": 1760,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I17-1"
        },
        {
            "AbsEntry": 1761,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I17-2"
        },
        {
            "AbsEntry": 1762,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I18-1"
        },
        {
            "AbsEntry": 1763,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1I18-2"
        },
        {
            "AbsEntry": 1764,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J01-1"
        },
        {
            "AbsEntry": 1765,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J01-2"
        },
        {
            "AbsEntry": 1766,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J02-1"
        },
        {
            "AbsEntry": 1767,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J02-2"
        },
        {
            "AbsEntry": 1768,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J03-1"
        },
        {
            "AbsEntry": 1769,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J03-2"
        },
        {
            "AbsEntry": 1770,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J04-1"
        },
        {
            "AbsEntry": 1771,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J04-2"
        },
        {
            "AbsEntry": 1772,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J05-1"
        },
        {
            "AbsEntry": 1773,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J05-2"
        },
        {
            "AbsEntry": 1774,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J06-1"
        },
        {
            "AbsEntry": 1775,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J06-2"
        },
        {
            "AbsEntry": 1776,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J07-1"
        },
        {
            "AbsEntry": 1777,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J07-2"
        },
        {
            "AbsEntry": 1778,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J08-1"
        },
        {
            "AbsEntry": 1779,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J08-2"
        },
        {
            "AbsEntry": 1780,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J09-1"
        },
        {
            "AbsEntry": 1781,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J09-2"
        },
        {
            "AbsEntry": 1782,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J10-1"
        },
        {
            "AbsEntry": 1783,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J10-2"
        },
        {
            "AbsEntry": 1784,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J11-1"
        },
        {
            "AbsEntry": 1785,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J11-2"
        },
        {
            "AbsEntry": 1786,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J12-1"
        },
        {
            "AbsEntry": 1787,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J12-2"
        },
        {
            "AbsEntry": 1788,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J13-1"
        },
        {
            "AbsEntry": 1789,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J13-2"
        },
        {
            "AbsEntry": 1790,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J14-1"
        },
        {
            "AbsEntry": 1791,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J14-2"
        },
        {
            "AbsEntry": 1792,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J15-1"
        },
        {
            "AbsEntry": 1793,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J15-2"
        },
        {
            "AbsEntry": 1794,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J16-1"
        },
        {
            "AbsEntry": 1795,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J16-2"
        },
        {
            "AbsEntry": 1796,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J17-1"
        },
        {
            "AbsEntry": 1797,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J17-2"
        },
        {
            "AbsEntry": 1798,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J18-1"
        },
        {
            "AbsEntry": 1799,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J18-2"
        },
        {
            "AbsEntry": 1800,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J19-1"
        },
        {
            "AbsEntry": 1801,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J19-2"
        },
        {
            "AbsEntry": 1802,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J20-1"
        },
        {
            "AbsEntry": 1803,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J20-2"
        },
        {
            "AbsEntry": 1804,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J21-1"
        },
        {
            "AbsEntry": 1805,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J21-2"
        },
        {
            "AbsEntry": 1806,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J22-1"
        },
        {
            "AbsEntry": 1807,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1J22-2"
        },
        {
            "AbsEntry": 1808,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K01-1"
        },
        {
            "AbsEntry": 1809,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K01-2"
        },
        {
            "AbsEntry": 1810,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K02-1"
        },
        {
            "AbsEntry": 1811,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K02-2"
        },
        {
            "AbsEntry": 1812,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K03-1"
        },
        {
            "AbsEntry": 1813,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K03-2"
        },
        {
            "AbsEntry": 1814,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K04-1"
        },
        {
            "AbsEntry": 1815,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K04-2"
        },
        {
            "AbsEntry": 1816,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K05-1"
        },
        {
            "AbsEntry": 1817,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K05-2"
        },
        {
            "AbsEntry": 1818,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K06-1"
        },
        {
            "AbsEntry": 1819,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K06-2"
        },
        {
            "AbsEntry": 1820,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K07-1"
        },
        {
            "AbsEntry": 1821,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K07-2"
        },
        {
            "AbsEntry": 1822,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K08-1"
        },
        {
            "AbsEntry": 1823,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K08-2"
        },
        {
            "AbsEntry": 1824,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K09-1"
        },
        {
            "AbsEntry": 1825,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K09-2"
        },
        {
            "AbsEntry": 1826,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K10-1"
        },
        {
            "AbsEntry": 1827,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K10-2"
        },
        {
            "AbsEntry": 1828,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K11-1"
        },
        {
            "AbsEntry": 1829,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K11-2"
        },
        {
            "AbsEntry": 1830,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K12-1"
        },
        {
            "AbsEntry": 1831,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K12-2"
        },
        {
            "AbsEntry": 1832,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K13-1"
        },
        {
            "AbsEntry": 1833,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K13-2"
        },
        {
            "AbsEntry": 1834,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K14-1"
        },
        {
            "AbsEntry": 1835,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K14-2"
        },
        {
            "AbsEntry": 1836,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K15-1"
        },
        {
            "AbsEntry": 1837,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K15-2"
        },
        {
            "AbsEntry": 1838,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K16-1"
        },
        {
            "AbsEntry": 1839,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K16-2"
        },
        {
            "AbsEntry": 1840,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K17-1"
        },
        {
            "AbsEntry": 1841,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K17-2"
        },
        {
            "AbsEntry": 1842,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K18-1"
        },
        {
            "AbsEntry": 1843,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K18-2"
        },
        {
            "AbsEntry": 1844,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K19-1"
        },
        {
            "AbsEntry": 1845,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K19-2"
        },
        {
            "AbsEntry": 1846,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K20-1"
        },
        {
            "AbsEntry": 1847,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K20-2"
        },
        {
            "AbsEntry": 1848,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K21-1"
        },
        {
            "AbsEntry": 1849,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K21-2"
        },
        {
            "AbsEntry": 1850,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K22-1"
        },
        {
            "AbsEntry": 1851,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K22-2"
        },
        {
            "AbsEntry": 1852,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K23-1"
        },
        {
            "AbsEntry": 1853,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K23-2"
        },
        {
            "AbsEntry": 1854,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K24-1"
        },
        {
            "AbsEntry": 1855,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K24-2"
        },
        {
            "AbsEntry": 1856,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K25-1"
        },
        {
            "AbsEntry": 1857,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K25-2"
        },
        {
            "AbsEntry": 1858,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K26-1"
        },
        {
            "AbsEntry": 1859,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K26-2"
        },
        {
            "AbsEntry": 1860,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K27-1"
        },
        {
            "AbsEntry": 1861,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K27-2"
        },
        {
            "AbsEntry": 1862,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K28-1"
        },
        {
            "AbsEntry": 1863,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K28-2"
        },
        {
            "AbsEntry": 1864,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K29-1"
        },
        {
            "AbsEntry": 1865,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K29-2"
        },
        {
            "AbsEntry": 1866,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K30-1"
        },
        {
            "AbsEntry": 1867,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K30-2"
        },
        {
            "AbsEntry": 1868,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K31-1"
        },
        {
            "AbsEntry": 1869,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K31-2"
        },
        {
            "AbsEntry": 1870,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K32-1"
        },
        {
            "AbsEntry": 1871,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K32-2"
        },
        {
            "AbsEntry": 1872,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K33-1"
        },
        {
            "AbsEntry": 1873,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K33-2"
        },
        {
            "AbsEntry": 1874,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K34-1"
        },
        {
            "AbsEntry": 1875,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K34-2"
        },
        {
            "AbsEntry": 1876,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K35-1"
        },
        {
            "AbsEntry": 1877,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K35-2"
        },
        {
            "AbsEntry": 1878,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K36-1"
        },
        {
            "AbsEntry": 1879,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K36-2"
        },
        {
            "AbsEntry": 1880,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K37-1"
        },
        {
            "AbsEntry": 1881,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K37-2"
        },
        {
            "AbsEntry": 1882,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K38-1"
        },
        {
            "AbsEntry": 1883,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K38-2"
        },
        {
            "AbsEntry": 1884,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K39-1"
        },
        {
            "AbsEntry": 1885,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K39-2"
        },
        {
            "AbsEntry": 1886,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K40-1"
        },
        {
            "AbsEntry": 1887,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K40-2"
        },
        {
            "AbsEntry": 1888,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K41-1"
        },
        {
            "AbsEntry": 1889,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K41-2"
        },
        {
            "AbsEntry": 1890,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K42-1"
        },
        {
            "AbsEntry": 1891,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K42-2"
        },
        {
            "AbsEntry": 1892,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K43-1"
        },
        {
            "AbsEntry": 1893,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K43-2"
        },
        {
            "AbsEntry": 1894,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K44-1"
        },
        {
            "AbsEntry": 1895,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K44-2"
        },
        {
            "AbsEntry": 1896,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K45-1"
        },
        {
            "AbsEntry": 1897,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K45-2"
        },
        {
            "AbsEntry": 1898,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K46-1"
        },
        {
            "AbsEntry": 1899,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K46-2"
        },
        {
            "AbsEntry": 1900,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K47-1"
        },
        {
            "AbsEntry": 1901,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K47-2"
        },
        {
            "AbsEntry": 1902,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K48-1"
        },
        {
            "AbsEntry": 1903,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K48-2"
        },
        {
            "AbsEntry": 1904,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K49-1"
        },
        {
            "AbsEntry": 1905,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K49-2"
        },
        {
            "AbsEntry": 1906,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K50-1"
        },
        {
            "AbsEntry": 1907,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K50-2"
        },
        {
            "AbsEntry": 1908,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K51-1"
        },
        {
            "AbsEntry": 1909,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K51-2"
        },
        {
            "AbsEntry": 1910,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K52-1"
        },
        {
            "AbsEntry": 1911,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K52-2"
        },
        {
            "AbsEntry": 1912,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K53-1"
        },
        {
            "AbsEntry": 1913,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K53-2"
        },
        {
            "AbsEntry": 1914,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K54-1"
        },
        {
            "AbsEntry": 1915,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K54-2"
        },
        {
            "AbsEntry": 1916,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K55-1"
        },
        {
            "AbsEntry": 1917,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K55-2"
        },
        {
            "AbsEntry": 1918,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K56-1"
        },
        {
            "AbsEntry": 1919,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K56-2"
        },
        {
            "AbsEntry": 1920,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K57-1"
        },
        {
            "AbsEntry": 1921,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K57-2"
        },
        {
            "AbsEntry": 1922,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K58-1"
        },
        {
            "AbsEntry": 1923,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K58-2"
        },
        {
            "AbsEntry": 1924,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K59-1"
        },
        {
            "AbsEntry": 1925,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K59-2"
        },
        {
            "AbsEntry": 1926,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K60-1"
        },
        {
            "AbsEntry": 1927,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K60-2"
        },
        {
            "AbsEntry": 1928,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K61-1"
        },
        {
            "AbsEntry": 1929,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K61-2"
        },
        {
            "AbsEntry": 1930,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K62-1"
        },
        {
            "AbsEntry": 1931,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K62-2"
        },
        {
            "AbsEntry": 1932,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K63-1"
        },
        {
            "AbsEntry": 1933,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K63-2"
        },
        {
            "AbsEntry": 1934,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K64-1"
        },
        {
            "AbsEntry": 1935,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K64-2"
        },
        {
            "AbsEntry": 1936,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K65-1"
        },
        {
            "AbsEntry": 1937,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K65-2"
        },
        {
            "AbsEntry": 1938,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K66-1"
        },
        {
            "AbsEntry": 1939,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K66-2"
        },
        {
            "AbsEntry": 1940,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K67-1"
        },
        {
            "AbsEntry": 1941,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K67-2"
        },
        {
            "AbsEntry": 1942,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K68-1"
        },
        {
            "AbsEntry": 1943,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K68-2"
        },
        {
            "AbsEntry": 1944,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K69-1"
        },
        {
            "AbsEntry": 1945,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K69-2"
        },
        {
            "AbsEntry": 1946,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K70-1"
        },
        {
            "AbsEntry": 1947,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K70-2"
        },
        {
            "AbsEntry": 1948,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K71-1"
        },
        {
            "AbsEntry": 1949,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K71-2"
        },
        {
            "AbsEntry": 1950,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K72-1"
        },
        {
            "AbsEntry": 1951,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K72-2"
        },
        {
            "AbsEntry": 1952,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K73-1"
        },
        {
            "AbsEntry": 1953,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K73-2"
        },
        {
            "AbsEntry": 1954,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K74-1"
        },
        {
            "AbsEntry": 1955,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K74-2"
        },
        {
            "AbsEntry": 1956,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K75-1"
        },
        {
            "AbsEntry": 1957,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K75-2"
        },
        {
            "AbsEntry": 1958,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K76-1"
        },
        {
            "AbsEntry": 1959,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K76-2"
        },
        {
            "AbsEntry": 1960,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K77-1"
        },
        {
            "AbsEntry": 1961,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K77-2"
        },
        {
            "AbsEntry": 1962,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K78-1"
        },
        {
            "AbsEntry": 1963,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K78-2"
        },
        {
            "AbsEntry": 1964,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K79-1"
        },
        {
            "AbsEntry": 1965,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K79-2"
        },
        {
            "AbsEntry": 1966,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K80-1"
        },
        {
            "AbsEntry": 1967,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K80-2"
        },
        {
            "AbsEntry": 1968,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K81-1"
        },
        {
            "AbsEntry": 1969,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K81-2"
        },
        {
            "AbsEntry": 1970,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K82-1"
        },
        {
            "AbsEntry": 1971,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K82-2"
        },
        {
            "AbsEntry": 1972,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K83-1"
        },
        {
            "AbsEntry": 1973,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K83-2"
        },
        {
            "AbsEntry": 1974,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K84-1"
        },
        {
            "AbsEntry": 1975,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K84-2"
        },
        {
            "AbsEntry": 1976,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K85-1"
        },
        {
            "AbsEntry": 1977,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K85-2"
        },
        {
            "AbsEntry": 1978,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K86-1"
        },
        {
            "AbsEntry": 1979,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K86-2"
        },
        {
            "AbsEntry": 1980,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K87-1"
        },
        {
            "AbsEntry": 1981,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K87-2"
        },
        {
            "AbsEntry": 1982,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K88-1"
        },
        {
            "AbsEntry": 1983,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1K88-2"
        },
        {
            "AbsEntry": 1984,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L01-1"
        },
        {
            "AbsEntry": 1985,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L01-2"
        },
        {
            "AbsEntry": 1986,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L02-1"
        },
        {
            "AbsEntry": 1987,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L02-2"
        },
        {
            "AbsEntry": 1988,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L03-1"
        },
        {
            "AbsEntry": 1989,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L03-2"
        },
        {
            "AbsEntry": 1990,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L04-1"
        },
        {
            "AbsEntry": 1991,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L04-2"
        },
        {
            "AbsEntry": 1992,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L05-1"
        },
        {
            "AbsEntry": 1993,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L05-2"
        },
        {
            "AbsEntry": 1994,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L06-1"
        },
        {
            "AbsEntry": 1995,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L06-2"
        },
        {
            "AbsEntry": 1996,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L07-1"
        },
        {
            "AbsEntry": 1997,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L07-2"
        },
        {
            "AbsEntry": 1998,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L08-1"
        },
        {
            "AbsEntry": 1999,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L08-2"
        },
        {
            "AbsEntry": 2000,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L09-1"
        },
        {
            "AbsEntry": 2001,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L09-2"
        },
        {
            "AbsEntry": 2002,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L10-1"
        },
        {
            "AbsEntry": 2003,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L10-2"
        },
        {
            "AbsEntry": 2004,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L11-1"
        },
        {
            "AbsEntry": 2005,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L11-2"
        },
        {
            "AbsEntry": 2006,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L12-1"
        },
        {
            "AbsEntry": 2007,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L12-2"
        },
        {
            "AbsEntry": 2008,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L13-1"
        },
        {
            "AbsEntry": 2009,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L13-2"
        },
        {
            "AbsEntry": 2010,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L14-1"
        },
        {
            "AbsEntry": 2011,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L14-2"
        },
        {
            "AbsEntry": 2012,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L14-3"
        },
        {
            "AbsEntry": 2013,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L15-1"
        },
        {
            "AbsEntry": 2014,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L15-2"
        },
        {
            "AbsEntry": 2015,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L15-3"
        },
        {
            "AbsEntry": 2016,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L16-1"
        },
        {
            "AbsEntry": 2017,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L16-2"
        },
        {
            "AbsEntry": 2018,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L16-3"
        },
        {
            "AbsEntry": 2019,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L17-1"
        },
        {
            "AbsEntry": 2020,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L17-2"
        },
        {
            "AbsEntry": 2021,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L17-3"
        },
        {
            "AbsEntry": 2022,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L18-1"
        },
        {
            "AbsEntry": 2023,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L18-2"
        },
        {
            "AbsEntry": 2024,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L19-1"
        },
        {
            "AbsEntry": 2025,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L19-2"
        },
        {
            "AbsEntry": 2026,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L20-1"
        },
        {
            "AbsEntry": 2027,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L20-2"
        },
        {
            "AbsEntry": 2028,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L21-1"
        },
        {
            "AbsEntry": 2029,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L21-2"
        },
        {
            "AbsEntry": 2030,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L22-1"
        },
        {
            "AbsEntry": 2031,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L22-2"
        },
        {
            "AbsEntry": 2032,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L23-1"
        },
        {
            "AbsEntry": 2033,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L23-2"
        },
        {
            "AbsEntry": 2034,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L24-1"
        },
        {
            "AbsEntry": 2035,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L24-2"
        },
        {
            "AbsEntry": 2036,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L25-1"
        },
        {
            "AbsEntry": 2037,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L25-2"
        },
        {
            "AbsEntry": 2038,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L26-1"
        },
        {
            "AbsEntry": 2039,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L26-2"
        },
        {
            "AbsEntry": 2040,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L26-3"
        },
        {
            "AbsEntry": 2041,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L27-1"
        },
        {
            "AbsEntry": 2042,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L27-2"
        },
        {
            "AbsEntry": 2043,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L27-3"
        },
        {
            "AbsEntry": 2044,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L28-1"
        },
        {
            "AbsEntry": 2045,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L28-2"
        },
        {
            "AbsEntry": 2046,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L28-3"
        },
        {
            "AbsEntry": 2047,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L29-1"
        },
        {
            "AbsEntry": 2048,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L29-2"
        },
        {
            "AbsEntry": 2049,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L29-3"
        },
        {
            "AbsEntry": 2050,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L30-1"
        },
        {
            "AbsEntry": 2051,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L30-2"
        },
        {
            "AbsEntry": 2052,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L30-3"
        },
        {
            "AbsEntry": 2053,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L31-1"
        },
        {
            "AbsEntry": 2054,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L31-2"
        },
        {
            "AbsEntry": 2055,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L31-3"
        },
        {
            "AbsEntry": 2056,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L32-1"
        },
        {
            "AbsEntry": 2057,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L32-2"
        },
        {
            "AbsEntry": 2058,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L32-3"
        },
        {
            "AbsEntry": 2059,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L33-1"
        },
        {
            "AbsEntry": 2060,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L33-2"
        },
        {
            "AbsEntry": 2061,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L33-3"
        },
        {
            "AbsEntry": 2062,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L34-1"
        },
        {
            "AbsEntry": 2063,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L34-2"
        },
        {
            "AbsEntry": 2064,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L34-3"
        },
        {
            "AbsEntry": 2065,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L35-1"
        },
        {
            "AbsEntry": 2066,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L35-2"
        },
        {
            "AbsEntry": 2067,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L35-3"
        },
        {
            "AbsEntry": 2068,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L36-1"
        },
        {
            "AbsEntry": 2069,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L36-2"
        },
        {
            "AbsEntry": 2070,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L37-1"
        },
        {
            "AbsEntry": 2071,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L37-2"
        },
        {
            "AbsEntry": 2072,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L38-1"
        },
        {
            "AbsEntry": 2073,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L38-2"
        },
        {
            "AbsEntry": 2074,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L39-1"
        },
        {
            "AbsEntry": 2075,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L39-2"
        },
        {
            "AbsEntry": 2076,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L40-1"
        },
        {
            "AbsEntry": 2077,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L40-2"
        },
        {
            "AbsEntry": 2078,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L41-1"
        },
        {
            "AbsEntry": 2079,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L41-2"
        },
        {
            "AbsEntry": 2080,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L42-1"
        },
        {
            "AbsEntry": 2081,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L42-2"
        },
        {
            "AbsEntry": 2082,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L43-1"
        },
        {
            "AbsEntry": 2083,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L43-2"
        },
        {
            "AbsEntry": 2084,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L44-1"
        },
        {
            "AbsEntry": 2085,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L44-2"
        },
        {
            "AbsEntry": 2086,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L45-1"
        },
        {
            "AbsEntry": 2087,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L45-2"
        },
        {
            "AbsEntry": 2088,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L46-1"
        },
        {
            "AbsEntry": 2089,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L46-2"
        },
        {
            "AbsEntry": 2090,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L47-1"
        },
        {
            "AbsEntry": 2091,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L47-2"
        },
        {
            "AbsEntry": 2092,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L48-1"
        },
        {
            "AbsEntry": 2093,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L48-2"
        },
        {
            "AbsEntry": 2094,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L49-1"
        },
        {
            "AbsEntry": 2095,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L49-2"
        },
        {
            "AbsEntry": 2096,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L50-1"
        },
        {
            "AbsEntry": 2097,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L50-2"
        },
        {
            "AbsEntry": 2098,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L51-1"
        },
        {
            "AbsEntry": 2099,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L51-2"
        },
        {
            "AbsEntry": 2100,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L52-1"
        },
        {
            "AbsEntry": 2101,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L52-2"
        },
        {
            "AbsEntry": 2102,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L53-1"
        },
        {
            "AbsEntry": 2103,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L53-2"
        },
        {
            "AbsEntry": 2104,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L54-1"
        },
        {
            "AbsEntry": 2105,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L54-2"
        },
        {
            "AbsEntry": 2106,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L55-1"
        },
        {
            "AbsEntry": 2107,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L55-2"
        },
        {
            "AbsEntry": 2108,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L56-1"
        },
        {
            "AbsEntry": 2109,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L56-2"
        },
        {
            "AbsEntry": 2110,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L57-1"
        },
        {
            "AbsEntry": 2111,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L57-2"
        },
        {
            "AbsEntry": 2112,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L58-1"
        },
        {
            "AbsEntry": 2113,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L58-2"
        },
        {
            "AbsEntry": 2114,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L59-1"
        },
        {
            "AbsEntry": 2115,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L59-2"
        },
        {
            "AbsEntry": 2116,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L60-1"
        },
        {
            "AbsEntry": 2117,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L60-2"
        },
        {
            "AbsEntry": 2118,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L61-1"
        },
        {
            "AbsEntry": 2119,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L61-2"
        },
        {
            "AbsEntry": 2120,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L62-1"
        },
        {
            "AbsEntry": 2121,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L62-2"
        },
        {
            "AbsEntry": 2122,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L63-1"
        },
        {
            "AbsEntry": 2123,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L63-2"
        },
        {
            "AbsEntry": 2124,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L64-1"
        },
        {
            "AbsEntry": 2125,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L64-2"
        },
        {
            "AbsEntry": 2126,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L65-1"
        },
        {
            "AbsEntry": 2127,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L65-2"
        },
        {
            "AbsEntry": 2128,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L66-1"
        },
        {
            "AbsEntry": 2129,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L66-2"
        },
        {
            "AbsEntry": 2130,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L67-1"
        },
        {
            "AbsEntry": 2131,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1L67-2"
        },
        {
            "AbsEntry": 2132,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M01-1"
        },
        {
            "AbsEntry": 2133,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M02-1"
        },
        {
            "AbsEntry": 2134,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M03-1"
        },
        {
            "AbsEntry": 2135,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M04-1"
        },
        {
            "AbsEntry": 2136,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M05-1"
        },
        {
            "AbsEntry": 2137,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M06-1"
        },
        {
            "AbsEntry": 2138,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M07-1"
        },
        {
            "AbsEntry": 2139,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M08-1"
        },
        {
            "AbsEntry": 2140,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M09-1"
        },
        {
            "AbsEntry": 2141,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M10-1"
        },
        {
            "AbsEntry": 2142,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M11-1"
        },
        {
            "AbsEntry": 2143,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M12-1"
        },
        {
            "AbsEntry": 2144,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M13-1"
        },
        {
            "AbsEntry": 2145,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M14-1"
        },
        {
            "AbsEntry": 2146,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M15-1"
        },
        {
            "AbsEntry": 2147,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M16-1"
        },
        {
            "AbsEntry": 2148,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M17-1"
        },
        {
            "AbsEntry": 2149,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M18-1"
        },
        {
            "AbsEntry": 2150,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M19-1"
        },
        {
            "AbsEntry": 2151,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M20-1"
        },
        {
            "AbsEntry": 2152,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M21-1"
        },
        {
            "AbsEntry": 2153,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M22-1"
        },
        {
            "AbsEntry": 2154,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M23-1"
        },
        {
            "AbsEntry": 2155,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M24-1"
        },
        {
            "AbsEntry": 2156,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M25-1"
        },
        {
            "AbsEntry": 2157,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M26-1"
        },
        {
            "AbsEntry": 2158,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M27-1"
        },
        {
            "AbsEntry": 2159,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M28-1"
        },
        {
            "AbsEntry": 2160,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M29-1"
        },
        {
            "AbsEntry": 2161,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M30-1"
        },
        {
            "AbsEntry": 2162,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M31-1"
        },
        {
            "AbsEntry": 2163,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M32-1"
        },
        {
            "AbsEntry": 2164,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M33-1"
        },
        {
            "AbsEntry": 2165,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M34-1"
        },
        {
            "AbsEntry": 2166,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M35-1"
        },
        {
            "AbsEntry": 2167,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M36-1"
        },
        {
            "AbsEntry": 2168,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1M37-1"
        },
        {
            "AbsEntry": 2169,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1R01-1"
        },
        {
            "AbsEntry": 2195,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Y01-1"
        },
        {
            "AbsEntry": 2199,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Y20-1"
        },
        {
            "AbsEntry": 2200,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Y30-1"
        },
        {
            "AbsEntry": 2170,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z01-1"
        },
        {
            "AbsEntry": 2171,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z01-2"
        },
        {
            "AbsEntry": 2172,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z02-1"
        },
        {
            "AbsEntry": 2173,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z02-2"
        },
        {
            "AbsEntry": 2174,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z03-1"
        },
        {
            "AbsEntry": 2175,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z03-2"
        },
        {
            "AbsEntry": 2176,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z04-1"
        },
        {
            "AbsEntry": 2177,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z04-2"
        },
        {
            "AbsEntry": 2178,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z05-1"
        },
        {
            "AbsEntry": 2179,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z05-2"
        },
        {
            "AbsEntry": 2180,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z06-1"
        },
        {
            "AbsEntry": 2181,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z06-2"
        },
        {
            "AbsEntry": 2182,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z07-1"
        },
        {
            "AbsEntry": 2183,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z07-2"
        },
        {
            "AbsEntry": 2184,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z08-1"
        },
        {
            "AbsEntry": 2185,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z08-2"
        },
        {
            "AbsEntry": 2186,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z09-1"
        },
        {
            "AbsEntry": 2187,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z09-2"
        },
        {
            "AbsEntry": 2188,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z10-1"
        },
        {
            "AbsEntry": 2189,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z10-2"
        },
        {
            "AbsEntry": 2190,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z11-1"
        },
        {
            "AbsEntry": 2191,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z11-2"
        },
        {
            "AbsEntry": 2192,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z12-1"
        },
        {
            "AbsEntry": 2193,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-1Z12-2"
        },
        {
            "AbsEntry": 2215,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A01-1"
        },
        {
            "AbsEntry": 2216,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A02-1"
        },
        {
            "AbsEntry": 2217,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A03-1"
        },
        {
            "AbsEntry": 2218,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A04-1"
        },
        {
            "AbsEntry": 2219,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A05-1"
        },
        {
            "AbsEntry": 2220,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A06-1"
        },
        {
            "AbsEntry": 2221,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A07-1"
        },
        {
            "AbsEntry": 2222,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A08-1"
        },
        {
            "AbsEntry": 2223,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A09-1"
        },
        {
            "AbsEntry": 2224,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A10-1"
        },
        {
            "AbsEntry": 2225,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A11-1"
        },
        {
            "AbsEntry": 2226,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A12-1"
        },
        {
            "AbsEntry": 2227,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A13-1"
        },
        {
            "AbsEntry": 2228,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A14-1"
        },
        {
            "AbsEntry": 2229,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A15-1"
        },
        {
            "AbsEntry": 2230,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A16-1"
        },
        {
            "AbsEntry": 2231,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A17-1"
        },
        {
            "AbsEntry": 2232,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A18-1"
        },
        {
            "AbsEntry": 2233,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A19-1"
        },
        {
            "AbsEntry": 2234,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A20-1"
        },
        {
            "AbsEntry": 2235,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A21-1"
        },
        {
            "AbsEntry": 2236,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A22-1"
        },
        {
            "AbsEntry": 2237,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A23-1"
        },
        {
            "AbsEntry": 2238,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A24-1"
        },
        {
            "AbsEntry": 2239,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A25-1"
        },
        {
            "AbsEntry": 2240,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A26-1"
        },
        {
            "AbsEntry": 2241,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A27-1"
        },
        {
            "AbsEntry": 2242,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A28-1"
        },
        {
            "AbsEntry": 2243,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A29-1"
        },
        {
            "AbsEntry": 2244,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2A30-1"
        },
        {
            "AbsEntry": 2245,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B11-1"
        },
        {
            "AbsEntry": 2246,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B12-1"
        },
        {
            "AbsEntry": 2247,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B13-1"
        },
        {
            "AbsEntry": 2248,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B14-1"
        },
        {
            "AbsEntry": 2249,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B15-1"
        },
        {
            "AbsEntry": 2250,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B16-1"
        },
        {
            "AbsEntry": 2251,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B17-1"
        },
        {
            "AbsEntry": 2252,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B18-1"
        },
        {
            "AbsEntry": 2253,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B19-1"
        },
        {
            "AbsEntry": 2254,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B20-1"
        },
        {
            "AbsEntry": 2255,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B21-1"
        },
        {
            "AbsEntry": 2256,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B22-1"
        },
        {
            "AbsEntry": 2257,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B23-1"
        },
        {
            "AbsEntry": 2258,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B24-1"
        },
        {
            "AbsEntry": 2259,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B25-1"
        },
        {
            "AbsEntry": 2260,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B26-1"
        },
        {
            "AbsEntry": 2261,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B27-1"
        },
        {
            "AbsEntry": 2262,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B28-1"
        },
        {
            "AbsEntry": 2263,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B29-1"
        },
        {
            "AbsEntry": 2264,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2B30-1"
        },
        {
            "AbsEntry": 2265,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C11-1"
        },
        {
            "AbsEntry": 2266,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C12-1"
        },
        {
            "AbsEntry": 2267,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C13-1"
        },
        {
            "AbsEntry": 2268,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C14-1"
        },
        {
            "AbsEntry": 2269,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C15-1"
        },
        {
            "AbsEntry": 2270,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C16-1"
        },
        {
            "AbsEntry": 2271,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C17-1"
        },
        {
            "AbsEntry": 2272,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C18-1"
        },
        {
            "AbsEntry": 2273,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C19-1"
        },
        {
            "AbsEntry": 2274,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C20-1"
        },
        {
            "AbsEntry": 2275,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C21-1"
        },
        {
            "AbsEntry": 2276,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C22-1"
        },
        {
            "AbsEntry": 2277,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C23-1"
        },
        {
            "AbsEntry": 2278,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C24-1"
        },
        {
            "AbsEntry": 2279,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C25-1"
        },
        {
            "AbsEntry": 2280,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C26-1"
        },
        {
            "AbsEntry": 2281,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C27-1"
        },
        {
            "AbsEntry": 2282,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C28-1"
        },
        {
            "AbsEntry": 2283,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C29-1"
        },
        {
            "AbsEntry": 2284,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2C30-1"
        },
        {
            "AbsEntry": 2285,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D11-1"
        },
        {
            "AbsEntry": 2286,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D12-1"
        },
        {
            "AbsEntry": 2287,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D13-1"
        },
        {
            "AbsEntry": 2288,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D14-1"
        },
        {
            "AbsEntry": 2289,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D15-1"
        },
        {
            "AbsEntry": 2290,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D16-1"
        },
        {
            "AbsEntry": 2291,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D17-1"
        },
        {
            "AbsEntry": 2292,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D18-1"
        },
        {
            "AbsEntry": 2293,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D19-1"
        },
        {
            "AbsEntry": 2294,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D20-1"
        },
        {
            "AbsEntry": 2295,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D21-1"
        },
        {
            "AbsEntry": 2296,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D22-1"
        },
        {
            "AbsEntry": 2297,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D23-1"
        },
        {
            "AbsEntry": 2298,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D24-1"
        },
        {
            "AbsEntry": 2299,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D25-1"
        },
        {
            "AbsEntry": 2300,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D26-1"
        },
        {
            "AbsEntry": 2301,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D27-1"
        },
        {
            "AbsEntry": 2302,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D28-1"
        },
        {
            "AbsEntry": 2303,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D29-1"
        },
        {
            "AbsEntry": 2304,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2D30-1"
        },
        {
            "AbsEntry": 2305,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E11-1"
        },
        {
            "AbsEntry": 2306,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E12-1"
        },
        {
            "AbsEntry": 2307,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E13-1"
        },
        {
            "AbsEntry": 2308,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E14-1"
        },
        {
            "AbsEntry": 2309,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E15-1"
        },
        {
            "AbsEntry": 2310,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E16-1"
        },
        {
            "AbsEntry": 2311,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E17-1"
        },
        {
            "AbsEntry": 2312,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E18-1"
        },
        {
            "AbsEntry": 2313,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E19-1"
        },
        {
            "AbsEntry": 2314,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E20-1"
        },
        {
            "AbsEntry": 2315,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E21-1"
        },
        {
            "AbsEntry": 2316,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E22-1"
        },
        {
            "AbsEntry": 2317,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E23-1"
        },
        {
            "AbsEntry": 2318,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E24-1"
        },
        {
            "AbsEntry": 2319,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E25-1"
        },
        {
            "AbsEntry": 2320,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E26-1"
        },
        {
            "AbsEntry": 2321,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E27-1"
        },
        {
            "AbsEntry": 2322,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E28-1"
        },
        {
            "AbsEntry": 2323,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E29-1"
        },
        {
            "AbsEntry": 2324,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2E30-1"
        },
        {
            "AbsEntry": 2325,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F11-1"
        },
        {
            "AbsEntry": 2326,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F12-1"
        },
        {
            "AbsEntry": 2327,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F13-1"
        },
        {
            "AbsEntry": 2328,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F14-1"
        },
        {
            "AbsEntry": 2329,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F15-1"
        },
        {
            "AbsEntry": 2330,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F16-1"
        },
        {
            "AbsEntry": 2331,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F17-1"
        },
        {
            "AbsEntry": 2332,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F18-1"
        },
        {
            "AbsEntry": 2333,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F19-1"
        },
        {
            "AbsEntry": 2334,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F20-1"
        },
        {
            "AbsEntry": 2335,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F21-1"
        },
        {
            "AbsEntry": 2336,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F22-1"
        },
        {
            "AbsEntry": 2337,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F23-1"
        },
        {
            "AbsEntry": 2338,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F24-1"
        },
        {
            "AbsEntry": 2339,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F25-1"
        },
        {
            "AbsEntry": 2340,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F26-1"
        },
        {
            "AbsEntry": 2341,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F27-1"
        },
        {
            "AbsEntry": 2342,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F28-1"
        },
        {
            "AbsEntry": 2343,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F29-1"
        },
        {
            "AbsEntry": 2344,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2F30-1"
        },
        {
            "AbsEntry": 2345,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G01-1"
        },
        {
            "AbsEntry": 2346,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G02-1"
        },
        {
            "AbsEntry": 2347,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G03-1"
        },
        {
            "AbsEntry": 2348,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G04-1"
        },
        {
            "AbsEntry": 2349,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G05-1"
        },
        {
            "AbsEntry": 2350,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G06-1"
        },
        {
            "AbsEntry": 2351,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G07-1"
        },
        {
            "AbsEntry": 2352,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G08-1"
        },
        {
            "AbsEntry": 2353,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G09-1"
        },
        {
            "AbsEntry": 2354,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G10-1"
        },
        {
            "AbsEntry": 2355,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G11-1"
        },
        {
            "AbsEntry": 2356,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G12-1"
        },
        {
            "AbsEntry": 2357,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G13-1"
        },
        {
            "AbsEntry": 2358,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G14-1"
        },
        {
            "AbsEntry": 2359,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G15-1"
        },
        {
            "AbsEntry": 2360,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G16-1"
        },
        {
            "AbsEntry": 2361,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G17-1"
        },
        {
            "AbsEntry": 2362,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G18-1"
        },
        {
            "AbsEntry": 2363,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G19-1"
        },
        {
            "AbsEntry": 2364,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G20-1"
        },
        {
            "AbsEntry": 2365,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G21-1"
        },
        {
            "AbsEntry": 2366,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G22-1"
        },
        {
            "AbsEntry": 2367,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G23-1"
        },
        {
            "AbsEntry": 2368,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G24-1"
        },
        {
            "AbsEntry": 2369,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G25-1"
        },
        {
            "AbsEntry": 2370,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G26-1"
        },
        {
            "AbsEntry": 2371,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G27-1"
        },
        {
            "AbsEntry": 2372,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G28-1"
        },
        {
            "AbsEntry": 2373,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G29-1"
        },
        {
            "AbsEntry": 2374,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2G30-1"
        },
        {
            "AbsEntry": 2375,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2H01-1"
        },
        {
            "AbsEntry": 2376,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2H02-1"
        },
        {
            "AbsEntry": 2377,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2H03-1"
        },
        {
            "AbsEntry": 2378,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2H04-1"
        },
        {
            "AbsEntry": 2379,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2H05-1"
        },
        {
            "AbsEntry": 2380,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2Z01-1"
        },
        {
            "AbsEntry": 2381,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2Z01-2"
        },
        {
            "AbsEntry": 2382,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2Z02-1"
        },
        {
            "AbsEntry": 2383,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2Z02-2"
        },
        {
            "AbsEntry": 2384,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2Z03-1"
        },
        {
            "AbsEntry": 2385,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2Z03-2"
        },
        {
            "AbsEntry": 2386,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2Z04-1"
        },
        {
            "AbsEntry": 2387,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2Z04-2"
        },
        {
            "AbsEntry": 2388,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2Z05-1"
        },
        {
            "AbsEntry": 2389,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2Z05-2"
        },
        {
            "AbsEntry": 2390,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2Z06-1"
        },
        {
            "AbsEntry": 2391,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-2Z06-2"
        },
        {
            "AbsEntry": 4222,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A01-1"
        },
        {
            "AbsEntry": 4223,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A01-2"
        },
        {
            "AbsEntry": 4224,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A01-3"
        },
        {
            "AbsEntry": 4226,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A02-1"
        },
        {
            "AbsEntry": 4227,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A02-2"
        },
        {
            "AbsEntry": 4228,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A02-3"
        },
        {
            "AbsEntry": 4230,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A03-1"
        },
        {
            "AbsEntry": 4231,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A03-2"
        },
        {
            "AbsEntry": 4232,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A03-3"
        },
        {
            "AbsEntry": 4234,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A04-1"
        },
        {
            "AbsEntry": 4235,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A04-2"
        },
        {
            "AbsEntry": 4236,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A04-3"
        },
        {
            "AbsEntry": 4238,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A05-1"
        },
        {
            "AbsEntry": 4239,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A05-2"
        },
        {
            "AbsEntry": 4240,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A05-3"
        },
        {
            "AbsEntry": 4242,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A06-1"
        },
        {
            "AbsEntry": 4243,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A06-2"
        },
        {
            "AbsEntry": 4244,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A06-3"
        },
        {
            "AbsEntry": 4246,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A07-1"
        },
        {
            "AbsEntry": 4247,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A07-2"
        },
        {
            "AbsEntry": 4248,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A07-3"
        },
        {
            "AbsEntry": 4250,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A08-1"
        },
        {
            "AbsEntry": 4251,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A08-2"
        },
        {
            "AbsEntry": 4252,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A08-3"
        },
        {
            "AbsEntry": 4254,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A09-1"
        },
        {
            "AbsEntry": 4255,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A09-2"
        },
        {
            "AbsEntry": 4256,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A09-3"
        },
        {
            "AbsEntry": 4258,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A10-1"
        },
        {
            "AbsEntry": 4259,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A10-2"
        },
        {
            "AbsEntry": 4260,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A10-3"
        },
        {
            "AbsEntry": 4262,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A11-1"
        },
        {
            "AbsEntry": 4263,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A11-2"
        },
        {
            "AbsEntry": 4264,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A11-3"
        },
        {
            "AbsEntry": 4266,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A12-1"
        },
        {
            "AbsEntry": 4267,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A12-2"
        },
        {
            "AbsEntry": 4268,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A12-3"
        },
        {
            "AbsEntry": 4270,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A13-1"
        },
        {
            "AbsEntry": 4271,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A13-2"
        },
        {
            "AbsEntry": 4272,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A13-3"
        },
        {
            "AbsEntry": 4274,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A14-1"
        },
        {
            "AbsEntry": 4275,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A14-2"
        },
        {
            "AbsEntry": 4276,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A14-3"
        },
        {
            "AbsEntry": 4278,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A15-1"
        },
        {
            "AbsEntry": 4279,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A15-2"
        },
        {
            "AbsEntry": 4280,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A15-3"
        },
        {
            "AbsEntry": 4282,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A16-1"
        },
        {
            "AbsEntry": 4283,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A16-2"
        },
        {
            "AbsEntry": 4284,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A16-3"
        },
        {
            "AbsEntry": 4286,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A17-1"
        },
        {
            "AbsEntry": 4287,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A17-2"
        },
        {
            "AbsEntry": 4288,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A17-3"
        },
        {
            "AbsEntry": 4290,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A18-1"
        },
        {
            "AbsEntry": 4291,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A18-2"
        },
        {
            "AbsEntry": 4292,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A18-3"
        },
        {
            "AbsEntry": 4294,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A19-1"
        },
        {
            "AbsEntry": 4295,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A19-2"
        },
        {
            "AbsEntry": 4296,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A19-3"
        },
        {
            "AbsEntry": 4298,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A20-1"
        },
        {
            "AbsEntry": 4299,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A20-2"
        },
        {
            "AbsEntry": 4300,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A20-3"
        },
        {
            "AbsEntry": 4302,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A21-1"
        },
        {
            "AbsEntry": 4303,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A21-2"
        },
        {
            "AbsEntry": 4304,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A21-3"
        },
        {
            "AbsEntry": 4306,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A22-1"
        },
        {
            "AbsEntry": 4307,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A22-2"
        },
        {
            "AbsEntry": 4308,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A22-3"
        },
        {
            "AbsEntry": 4310,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A23-1"
        },
        {
            "AbsEntry": 4311,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A23-2"
        },
        {
            "AbsEntry": 4312,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A23-3"
        },
        {
            "AbsEntry": 4314,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A24-1"
        },
        {
            "AbsEntry": 4315,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A24-2"
        },
        {
            "AbsEntry": 4316,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A24-3"
        },
        {
            "AbsEntry": 4318,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A25-1"
        },
        {
            "AbsEntry": 4319,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A25-2"
        },
        {
            "AbsEntry": 4320,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A25-3"
        },
        {
            "AbsEntry": 4322,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A26-1"
        },
        {
            "AbsEntry": 4323,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A26-2"
        },
        {
            "AbsEntry": 4324,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A26-3"
        },
        {
            "AbsEntry": 4326,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A27-1"
        },
        {
            "AbsEntry": 4327,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A27-2"
        },
        {
            "AbsEntry": 4328,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A27-3"
        },
        {
            "AbsEntry": 4330,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A28-1"
        },
        {
            "AbsEntry": 4331,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A28-2"
        },
        {
            "AbsEntry": 4332,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A28-3"
        },
        {
            "AbsEntry": 4334,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A29-1"
        },
        {
            "AbsEntry": 4335,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A29-2"
        },
        {
            "AbsEntry": 4336,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A29-3"
        },
        {
            "AbsEntry": 4338,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A30-1"
        },
        {
            "AbsEntry": 4339,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A30-2"
        },
        {
            "AbsEntry": 4340,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A30-3"
        },
        {
            "AbsEntry": 4342,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A31-1"
        },
        {
            "AbsEntry": 4343,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A31-2"
        },
        {
            "AbsEntry": 4344,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A31-3"
        },
        {
            "AbsEntry": 4346,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A32-1"
        },
        {
            "AbsEntry": 4347,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A32-2"
        },
        {
            "AbsEntry": 4348,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A32-3"
        },
        {
            "AbsEntry": 4350,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A33-1"
        },
        {
            "AbsEntry": 4351,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A33-2"
        },
        {
            "AbsEntry": 4352,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A33-3"
        },
        {
            "AbsEntry": 4354,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A34-1"
        },
        {
            "AbsEntry": 4355,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A34-2"
        },
        {
            "AbsEntry": 4356,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A34-3"
        },
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
        },
        {
            "AbsEntry": 4362,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A36-1"
        },
        {
            "AbsEntry": 4363,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A36-2"
        },
        {
            "AbsEntry": 4364,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A36-3"
        },
        {
            "AbsEntry": 4366,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A37-1"
        },
        {
            "AbsEntry": 4367,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A37-2"
        },
        {
            "AbsEntry": 4368,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A37-3"
        },
        {
            "AbsEntry": 4370,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A38-1"
        },
        {
            "AbsEntry": 4371,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A38-2"
        },
        {
            "AbsEntry": 4372,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A38-3"
        },
        {
            "AbsEntry": 4374,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A39-1"
        },
        {
            "AbsEntry": 4375,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A39-2"
        },
        {
            "AbsEntry": 4376,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A39-3"
        },
        {
            "AbsEntry": 4378,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A40-1"
        },
        {
            "AbsEntry": 4379,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A40-2"
        },
        {
            "AbsEntry": 4380,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3A40-3"
        },
        {
            "AbsEntry": 4382,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B01-1"
        },
        {
            "AbsEntry": 4383,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B01-2"
        },
        {
            "AbsEntry": 4384,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B01-3"
        },
        {
            "AbsEntry": 4386,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B02-1"
        },
        {
            "AbsEntry": 4387,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B02-2"
        },
        {
            "AbsEntry": 4388,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B02-3"
        },
        {
            "AbsEntry": 4390,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B03-1"
        },
        {
            "AbsEntry": 4391,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B03-2"
        },
        {
            "AbsEntry": 4392,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B03-3"
        },
        {
            "AbsEntry": 4394,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B04-1"
        },
        {
            "AbsEntry": 4395,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B04-2"
        },
        {
            "AbsEntry": 4396,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B04-3"
        },
        {
            "AbsEntry": 4398,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B05-1"
        },
        {
            "AbsEntry": 4399,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B05-2"
        },
        {
            "AbsEntry": 4400,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B05-3"
        },
        {
            "AbsEntry": 4402,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B06-1"
        },
        {
            "AbsEntry": 4403,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B06-2"
        },
        {
            "AbsEntry": 4404,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B06-3"
        },
        {
            "AbsEntry": 4406,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B07-1"
        },
        {
            "AbsEntry": 4407,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B07-2"
        },
        {
            "AbsEntry": 4408,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B07-3"
        },
        {
            "AbsEntry": 4410,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B08-1"
        },
        {
            "AbsEntry": 4411,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B08-2"
        },
        {
            "AbsEntry": 4412,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B08-3"
        },
        {
            "AbsEntry": 4414,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B09-1"
        },
        {
            "AbsEntry": 4415,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B09-2"
        },
        {
            "AbsEntry": 4416,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B09-3"
        },
        {
            "AbsEntry": 4418,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B10-1"
        },
        {
            "AbsEntry": 4419,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B10-2"
        },
        {
            "AbsEntry": 4420,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B10-3"
        },
        {
            "AbsEntry": 4422,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B11-1"
        },
        {
            "AbsEntry": 4423,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B11-2"
        },
        {
            "AbsEntry": 4424,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B11-3"
        },
        {
            "AbsEntry": 4426,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B12-1"
        },
        {
            "AbsEntry": 4427,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B12-2"
        },
        {
            "AbsEntry": 4428,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B12-3"
        },
        {
            "AbsEntry": 4430,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B13-1"
        },
        {
            "AbsEntry": 4431,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B13-2"
        },
        {
            "AbsEntry": 4432,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B13-3"
        },
        {
            "AbsEntry": 4434,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B14-1"
        },
        {
            "AbsEntry": 4435,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B14-2"
        },
        {
            "AbsEntry": 4436,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B14-3"
        },
        {
            "AbsEntry": 4438,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B15-1"
        },
        {
            "AbsEntry": 4439,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B15-2"
        },
        {
            "AbsEntry": 4440,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B15-3"
        },
        {
            "AbsEntry": 4442,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B16-1"
        },
        {
            "AbsEntry": 4443,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B16-2"
        },
        {
            "AbsEntry": 4444,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B16-3"
        },
        {
            "AbsEntry": 4446,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B17-1"
        },
        {
            "AbsEntry": 4447,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B17-2"
        },
        {
            "AbsEntry": 4448,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B17-3"
        },
        {
            "AbsEntry": 4450,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B18-1"
        },
        {
            "AbsEntry": 4451,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B18-2"
        },
        {
            "AbsEntry": 4452,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B18-3"
        },
        {
            "AbsEntry": 4454,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B19-1"
        },
        {
            "AbsEntry": 4455,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B19-2"
        },
        {
            "AbsEntry": 4456,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B19-3"
        },
        {
            "AbsEntry": 4458,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B20-1"
        },
        {
            "AbsEntry": 4459,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B20-2"
        },
        {
            "AbsEntry": 4460,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B20-3"
        },
        {
            "AbsEntry": 4462,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B21-1"
        },
        {
            "AbsEntry": 4463,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B21-2"
        },
        {
            "AbsEntry": 4464,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B21-3"
        },
        {
            "AbsEntry": 4466,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B22-1"
        },
        {
            "AbsEntry": 4467,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B22-2"
        },
        {
            "AbsEntry": 4468,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B22-3"
        },
        {
            "AbsEntry": 4470,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B23-1"
        },
        {
            "AbsEntry": 4471,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B23-2"
        },
        {
            "AbsEntry": 4472,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B23-3"
        },
        {
            "AbsEntry": 4474,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B24-1"
        },
        {
            "AbsEntry": 4475,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B24-2"
        },
        {
            "AbsEntry": 4476,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B24-3"
        },
        {
            "AbsEntry": 4478,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B25-1"
        },
        {
            "AbsEntry": 4479,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B25-2"
        },
        {
            "AbsEntry": 4480,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B25-3"
        },
        {
            "AbsEntry": 4482,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B26-1"
        },
        {
            "AbsEntry": 4483,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B26-2"
        },
        {
            "AbsEntry": 4484,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B26-3"
        },
        {
            "AbsEntry": 4486,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B27-1"
        },
        {
            "AbsEntry": 4487,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B27-2"
        },
        {
            "AbsEntry": 4488,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B27-3"
        },
        {
            "AbsEntry": 4490,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B28-1"
        },
        {
            "AbsEntry": 4491,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B28-2"
        },
        {
            "AbsEntry": 4492,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B28-3"
        },
        {
            "AbsEntry": 4494,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B29-1"
        },
        {
            "AbsEntry": 4495,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B29-2"
        },
        {
            "AbsEntry": 4496,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B29-3"
        },
        {
            "AbsEntry": 4498,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B30-1"
        },
        {
            "AbsEntry": 4499,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B30-2"
        },
        {
            "AbsEntry": 4500,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B30-3"
        },
        {
            "AbsEntry": 4502,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B31-1"
        },
        {
            "AbsEntry": 4503,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B31-2"
        },
        {
            "AbsEntry": 4504,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B31-3"
        },
        {
            "AbsEntry": 4506,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B32-1"
        },
        {
            "AbsEntry": 4507,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B32-2"
        },
        {
            "AbsEntry": 4508,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B32-3"
        },
        {
            "AbsEntry": 4510,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B33-1"
        },
        {
            "AbsEntry": 4511,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B33-2"
        },
        {
            "AbsEntry": 4512,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B33-3"
        },
        {
            "AbsEntry": 4514,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B34-1"
        },
        {
            "AbsEntry": 4515,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B34-2"
        },
        {
            "AbsEntry": 4516,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B34-3"
        },
        {
            "AbsEntry": 4518,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B35-1"
        },
        {
            "AbsEntry": 4519,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B35-2"
        },
        {
            "AbsEntry": 4520,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B35-3"
        },
        {
            "AbsEntry": 4522,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B36-1"
        },
        {
            "AbsEntry": 4523,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B36-2"
        },
        {
            "AbsEntry": 4524,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B36-3"
        },
        {
            "AbsEntry": 4526,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B37-1"
        },
        {
            "AbsEntry": 4527,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B37-2"
        },
        {
            "AbsEntry": 4528,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B37-3"
        },
        {
            "AbsEntry": 4530,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B38-1"
        },
        {
            "AbsEntry": 4531,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B38-2"
        },
        {
            "AbsEntry": 4532,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B38-3"
        },
        {
            "AbsEntry": 4534,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B39-1"
        },
        {
            "AbsEntry": 4535,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B39-2"
        },
        {
            "AbsEntry": 4536,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B39-3"
        },
        {
            "AbsEntry": 4538,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B40-1"
        },
        {
            "AbsEntry": 4539,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B40-2"
        },
        {
            "AbsEntry": 4540,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3B40-3"
        },
        {
            "AbsEntry": 4542,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C01-1"
        },
        {
            "AbsEntry": 4543,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C01-2"
        },
        {
            "AbsEntry": 4544,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C01-3"
        },
        {
            "AbsEntry": 4546,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C02-1"
        },
        {
            "AbsEntry": 4547,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C02-2"
        },
        {
            "AbsEntry": 4548,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C02-3"
        },
        {
            "AbsEntry": 4550,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C03-1"
        },
        {
            "AbsEntry": 4551,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C03-2"
        },
        {
            "AbsEntry": 4552,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C03-3"
        },
        {
            "AbsEntry": 4554,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C04-1"
        },
        {
            "AbsEntry": 4555,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C04-2"
        },
        {
            "AbsEntry": 4556,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C04-3"
        },
        {
            "AbsEntry": 4558,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C05-1"
        },
        {
            "AbsEntry": 4559,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C05-2"
        },
        {
            "AbsEntry": 4560,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C05-3"
        },
        {
            "AbsEntry": 4562,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C06-1"
        },
        {
            "AbsEntry": 4563,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C06-2"
        },
        {
            "AbsEntry": 4564,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C06-3"
        },
        {
            "AbsEntry": 4566,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C07-1"
        },
        {
            "AbsEntry": 4567,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C07-2"
        },
        {
            "AbsEntry": 4568,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C07-3"
        },
        {
            "AbsEntry": 4570,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C08-1"
        },
        {
            "AbsEntry": 4571,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C08-2"
        },
        {
            "AbsEntry": 4572,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C08-3"
        },
        {
            "AbsEntry": 4574,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C09-1"
        },
        {
            "AbsEntry": 4575,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C09-2"
        },
        {
            "AbsEntry": 4576,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C09-3"
        },
        {
            "AbsEntry": 4578,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C10-1"
        },
        {
            "AbsEntry": 4579,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C10-2"
        },
        {
            "AbsEntry": 4580,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C10-3"
        },
        {
            "AbsEntry": 4582,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C11-1"
        },
        {
            "AbsEntry": 4583,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C11-2"
        },
        {
            "AbsEntry": 4584,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C11-3"
        },
        {
            "AbsEntry": 4586,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C12-1"
        },
        {
            "AbsEntry": 4587,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C12-2"
        },
        {
            "AbsEntry": 4588,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C12-3"
        },
        {
            "AbsEntry": 4590,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C13-1"
        },
        {
            "AbsEntry": 4591,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C13-2"
        },
        {
            "AbsEntry": 4592,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C13-3"
        },
        {
            "AbsEntry": 4594,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C14-1"
        },
        {
            "AbsEntry": 4595,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C14-2"
        },
        {
            "AbsEntry": 4596,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C14-3"
        },
        {
            "AbsEntry": 4598,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C15-1"
        },
        {
            "AbsEntry": 4599,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C15-2"
        },
        {
            "AbsEntry": 4600,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C15-3"
        },
        {
            "AbsEntry": 4602,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C16-1"
        },
        {
            "AbsEntry": 4603,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C16-2"
        },
        {
            "AbsEntry": 4604,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C16-3"
        },
        {
            "AbsEntry": 4606,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C17-1"
        },
        {
            "AbsEntry": 4607,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C17-2"
        },
        {
            "AbsEntry": 4608,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C17-3"
        },
        {
            "AbsEntry": 4610,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C18-1"
        },
        {
            "AbsEntry": 4611,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C18-2"
        },
        {
            "AbsEntry": 4612,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C18-3"
        },
        {
            "AbsEntry": 4614,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C19-1"
        },
        {
            "AbsEntry": 4615,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C19-2"
        },
        {
            "AbsEntry": 4616,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C19-3"
        },
        {
            "AbsEntry": 4618,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C20-1"
        },
        {
            "AbsEntry": 4619,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C20-2"
        },
        {
            "AbsEntry": 4620,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C20-3"
        },
        {
            "AbsEntry": 4622,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C21-1"
        },
        {
            "AbsEntry": 4623,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C21-2"
        },
        {
            "AbsEntry": 4624,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C21-3"
        },
        {
            "AbsEntry": 4626,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C22-1"
        },
        {
            "AbsEntry": 4627,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C22-2"
        },
        {
            "AbsEntry": 4628,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C22-3"
        },
        {
            "AbsEntry": 4630,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C23-1"
        },
        {
            "AbsEntry": 4631,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C23-2"
        },
        {
            "AbsEntry": 4632,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C23-3"
        },
        {
            "AbsEntry": 4634,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C24-1"
        },
        {
            "AbsEntry": 4635,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C24-2"
        },
        {
            "AbsEntry": 4636,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C24-3"
        },
        {
            "AbsEntry": 4638,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C25-1"
        },
        {
            "AbsEntry": 4639,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C25-2"
        },
        {
            "AbsEntry": 4640,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C25-3"
        },
        {
            "AbsEntry": 4642,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C26-1"
        },
        {
            "AbsEntry": 4643,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C26-2"
        },
        {
            "AbsEntry": 4644,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C26-3"
        },
        {
            "AbsEntry": 4646,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C27-1"
        },
        {
            "AbsEntry": 4647,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C27-2"
        },
        {
            "AbsEntry": 4648,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C27-3"
        },
        {
            "AbsEntry": 4650,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C28-1"
        },
        {
            "AbsEntry": 4651,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C28-2"
        },
        {
            "AbsEntry": 4652,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C28-3"
        },
        {
            "AbsEntry": 4654,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C29-1"
        },
        {
            "AbsEntry": 4655,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C29-2"
        },
        {
            "AbsEntry": 4656,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C29-3"
        },
        {
            "AbsEntry": 4658,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C30-1"
        },
        {
            "AbsEntry": 4659,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C30-2"
        },
        {
            "AbsEntry": 4660,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C30-3"
        },
        {
            "AbsEntry": 4662,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C31-1"
        },
        {
            "AbsEntry": 4663,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C31-2"
        },
        {
            "AbsEntry": 4664,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C31-3"
        },
        {
            "AbsEntry": 4666,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C32-1"
        },
        {
            "AbsEntry": 4667,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C32-2"
        },
        {
            "AbsEntry": 4668,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C32-3"
        },
        {
            "AbsEntry": 4670,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C33-1"
        },
        {
            "AbsEntry": 4671,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C33-2"
        },
        {
            "AbsEntry": 4672,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C33-3"
        },
        {
            "AbsEntry": 4674,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C34-1"
        },
        {
            "AbsEntry": 4675,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C34-2"
        },
        {
            "AbsEntry": 4676,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C34-3"
        },
        {
            "AbsEntry": 4678,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C35-1"
        },
        {
            "AbsEntry": 4679,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C35-2"
        },
        {
            "AbsEntry": 4680,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C35-3"
        },
        {
            "AbsEntry": 4682,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C36-1"
        },
        {
            "AbsEntry": 4683,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C36-2"
        },
        {
            "AbsEntry": 4684,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C36-3"
        },
        {
            "AbsEntry": 4686,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C37-1"
        },
        {
            "AbsEntry": 4687,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C37-2"
        },
        {
            "AbsEntry": 4688,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C37-3"
        },
        {
            "AbsEntry": 4690,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C38-1"
        },
        {
            "AbsEntry": 4691,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C38-2"
        },
        {
            "AbsEntry": 4692,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C38-3"
        },
        {
            "AbsEntry": 4694,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C39-1"
        },
        {
            "AbsEntry": 4695,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C39-2"
        },
        {
            "AbsEntry": 4696,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C39-3"
        },
        {
            "AbsEntry": 4698,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C40-1"
        },
        {
            "AbsEntry": 4699,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C40-2"
        },
        {
            "AbsEntry": 4700,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3C40-3"
        },
        {
            "AbsEntry": 4702,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D01-1"
        },
        {
            "AbsEntry": 4703,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D01-2"
        },
        {
            "AbsEntry": 4704,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D01-3"
        },
        {
            "AbsEntry": 4706,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D02-1"
        },
        {
            "AbsEntry": 4707,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D02-2"
        },
        {
            "AbsEntry": 4708,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D02-3"
        },
        {
            "AbsEntry": 4710,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D03-1"
        },
        {
            "AbsEntry": 4711,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D03-2"
        },
        {
            "AbsEntry": 4712,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D03-3"
        },
        {
            "AbsEntry": 4714,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D04-1"
        },
        {
            "AbsEntry": 4715,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D04-2"
        },
        {
            "AbsEntry": 4716,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D04-3"
        },
        {
            "AbsEntry": 4718,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D05-1"
        },
        {
            "AbsEntry": 4719,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D05-2"
        },
        {
            "AbsEntry": 4720,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D05-3"
        },
        {
            "AbsEntry": 4722,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D06-1"
        },
        {
            "AbsEntry": 4723,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D06-2"
        },
        {
            "AbsEntry": 4724,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D06-3"
        },
        {
            "AbsEntry": 4726,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D07-1"
        },
        {
            "AbsEntry": 4727,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D07-2"
        },
        {
            "AbsEntry": 4728,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D07-3"
        },
        {
            "AbsEntry": 4730,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D08-1"
        },
        {
            "AbsEntry": 4731,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D08-2"
        },
        {
            "AbsEntry": 4732,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D08-3"
        },
        {
            "AbsEntry": 4734,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D09-1"
        },
        {
            "AbsEntry": 4735,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D09-2"
        },
        {
            "AbsEntry": 4736,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D09-3"
        },
        {
            "AbsEntry": 4738,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D10-1"
        },
        {
            "AbsEntry": 4739,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D10-2"
        },
        {
            "AbsEntry": 4740,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D10-3"
        },
        {
            "AbsEntry": 4742,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D11-1"
        },
        {
            "AbsEntry": 4743,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D11-2"
        },
        {
            "AbsEntry": 4744,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D11-3"
        },
        {
            "AbsEntry": 4746,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D12-1"
        },
        {
            "AbsEntry": 4747,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D12-2"
        },
        {
            "AbsEntry": 4748,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D12-3"
        },
        {
            "AbsEntry": 4750,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D13-1"
        },
        {
            "AbsEntry": 4751,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D13-2"
        },
        {
            "AbsEntry": 4752,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D13-3"
        },
        {
            "AbsEntry": 4754,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D14-1"
        },
        {
            "AbsEntry": 4755,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D14-2"
        },
        {
            "AbsEntry": 4756,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D14-3"
        },
        {
            "AbsEntry": 4758,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D15-1"
        },
        {
            "AbsEntry": 4759,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D15-2"
        },
        {
            "AbsEntry": 4760,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D15-3"
        },
        {
            "AbsEntry": 4762,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D16-1"
        },
        {
            "AbsEntry": 4763,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D16-2"
        },
        {
            "AbsEntry": 4764,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D16-3"
        },
        {
            "AbsEntry": 4766,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D17-1"
        },
        {
            "AbsEntry": 4767,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D17-2"
        },
        {
            "AbsEntry": 4768,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D17-3"
        },
        {
            "AbsEntry": 4770,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D18-1"
        },
        {
            "AbsEntry": 4771,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D18-2"
        },
        {
            "AbsEntry": 4772,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D18-3"
        },
        {
            "AbsEntry": 4774,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D19-1"
        },
        {
            "AbsEntry": 4775,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D19-2"
        },
        {
            "AbsEntry": 4776,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D19-3"
        },
        {
            "AbsEntry": 4778,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D20-1"
        },
        {
            "AbsEntry": 4779,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D20-2"
        },
        {
            "AbsEntry": 4780,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D20-3"
        },
        {
            "AbsEntry": 4782,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D21-1"
        },
        {
            "AbsEntry": 4783,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D21-2"
        },
        {
            "AbsEntry": 4784,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D21-3"
        },
        {
            "AbsEntry": 4786,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D22-1"
        },
        {
            "AbsEntry": 4787,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D22-2"
        },
        {
            "AbsEntry": 4788,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D22-3"
        },
        {
            "AbsEntry": 4790,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D23-1"
        },
        {
            "AbsEntry": 4791,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D23-2"
        },
        {
            "AbsEntry": 4792,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D23-3"
        },
        {
            "AbsEntry": 4794,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D24-1"
        },
        {
            "AbsEntry": 4795,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D24-2"
        },
        {
            "AbsEntry": 4796,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D24-3"
        },
        {
            "AbsEntry": 4798,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D25-1"
        },
        {
            "AbsEntry": 4799,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D25-2"
        },
        {
            "AbsEntry": 4800,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D25-3"
        },
        {
            "AbsEntry": 4802,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D26-1"
        },
        {
            "AbsEntry": 4803,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D26-2"
        },
        {
            "AbsEntry": 4804,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D26-3"
        },
        {
            "AbsEntry": 4806,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D27-1"
        },
        {
            "AbsEntry": 4807,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D27-2"
        },
        {
            "AbsEntry": 4808,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D27-3"
        },
        {
            "AbsEntry": 4810,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D28-1"
        },
        {
            "AbsEntry": 4811,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D28-2"
        },
        {
            "AbsEntry": 4812,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D28-3"
        },
        {
            "AbsEntry": 4814,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D29-1"
        },
        {
            "AbsEntry": 4815,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D29-2"
        },
        {
            "AbsEntry": 4816,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D29-3"
        },
        {
            "AbsEntry": 4818,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D30-1"
        },
        {
            "AbsEntry": 4819,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D30-2"
        },
        {
            "AbsEntry": 4820,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D30-3"
        },
        {
            "AbsEntry": 4822,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D31-1"
        },
        {
            "AbsEntry": 4823,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D31-2"
        },
        {
            "AbsEntry": 4824,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D31-3"
        },
        {
            "AbsEntry": 4826,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D32-1"
        },
        {
            "AbsEntry": 4827,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D32-2"
        },
        {
            "AbsEntry": 4828,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D32-3"
        },
        {
            "AbsEntry": 4830,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D33-1"
        },
        {
            "AbsEntry": 4831,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D33-2"
        },
        {
            "AbsEntry": 4832,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D33-3"
        },
        {
            "AbsEntry": 4834,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D34-1"
        },
        {
            "AbsEntry": 4835,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D34-2"
        },
        {
            "AbsEntry": 4836,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D34-3"
        },
        {
            "AbsEntry": 4838,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D35-1"
        },
        {
            "AbsEntry": 4839,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D35-2"
        },
        {
            "AbsEntry": 4840,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D35-3"
        },
        {
            "AbsEntry": 4842,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D36-1"
        },
        {
            "AbsEntry": 4843,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D36-2"
        },
        {
            "AbsEntry": 4844,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D36-3"
        },
        {
            "AbsEntry": 4846,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D37-1"
        },
        {
            "AbsEntry": 4847,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D37-2"
        },
        {
            "AbsEntry": 4848,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D37-3"
        },
        {
            "AbsEntry": 4850,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D38-1"
        },
        {
            "AbsEntry": 4851,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D38-2"
        },
        {
            "AbsEntry": 4852,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D38-3"
        },
        {
            "AbsEntry": 4854,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D39-1"
        },
        {
            "AbsEntry": 4855,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D39-2"
        },
        {
            "AbsEntry": 4856,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D39-3"
        },
        {
            "AbsEntry": 4858,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D40-1"
        },
        {
            "AbsEntry": 4859,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D40-2"
        },
        {
            "AbsEntry": 4860,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3D40-3"
        },
        {
            "AbsEntry": 4862,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E01-1"
        },
        {
            "AbsEntry": 4863,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E01-2"
        },
        {
            "AbsEntry": 4864,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E01-3"
        },
        {
            "AbsEntry": 4866,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E02-1"
        },
        {
            "AbsEntry": 4867,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E02-2"
        },
        {
            "AbsEntry": 4868,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E02-3"
        },
        {
            "AbsEntry": 4870,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E03-1"
        },
        {
            "AbsEntry": 4871,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E03-2"
        },
        {
            "AbsEntry": 4872,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E03-3"
        },
        {
            "AbsEntry": 4874,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E04-1"
        },
        {
            "AbsEntry": 4875,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E04-2"
        },
        {
            "AbsEntry": 4876,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E04-3"
        },
        {
            "AbsEntry": 4878,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E05-1"
        },
        {
            "AbsEntry": 4879,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E05-2"
        },
        {
            "AbsEntry": 4880,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E05-3"
        },
        {
            "AbsEntry": 4882,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E06-1"
        },
        {
            "AbsEntry": 4883,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E06-2"
        },
        {
            "AbsEntry": 4884,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E06-3"
        },
        {
            "AbsEntry": 4886,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E07-1"
        },
        {
            "AbsEntry": 4887,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E07-2"
        },
        {
            "AbsEntry": 4888,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E07-3"
        },
        {
            "AbsEntry": 4890,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E08-1"
        },
        {
            "AbsEntry": 4891,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E08-2"
        },
        {
            "AbsEntry": 4892,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E08-3"
        },
        {
            "AbsEntry": 4894,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E09-1"
        },
        {
            "AbsEntry": 4895,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E09-2"
        },
        {
            "AbsEntry": 4896,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E09-3"
        },
        {
            "AbsEntry": 4898,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E10-1"
        },
        {
            "AbsEntry": 4899,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E10-2"
        },
        {
            "AbsEntry": 4900,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E10-3"
        },
        {
            "AbsEntry": 4902,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E11-1"
        },
        {
            "AbsEntry": 4903,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E11-2"
        },
        {
            "AbsEntry": 4904,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E11-3"
        },
        {
            "AbsEntry": 4906,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E12-1"
        },
        {
            "AbsEntry": 4907,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E12-2"
        },
        {
            "AbsEntry": 4908,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E12-3"
        },
        {
            "AbsEntry": 4910,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E13-1"
        },
        {
            "AbsEntry": 4911,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E13-2"
        },
        {
            "AbsEntry": 4912,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E13-3"
        },
        {
            "AbsEntry": 4914,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E14-1"
        },
        {
            "AbsEntry": 4915,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E14-2"
        },
        {
            "AbsEntry": 4916,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E14-3"
        },
        {
            "AbsEntry": 4918,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E15-1"
        },
        {
            "AbsEntry": 4919,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E15-2"
        },
        {
            "AbsEntry": 4920,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E15-3"
        },
        {
            "AbsEntry": 4922,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E16-1"
        },
        {
            "AbsEntry": 4923,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E16-2"
        },
        {
            "AbsEntry": 4924,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E16-3"
        },
        {
            "AbsEntry": 4926,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E17-1"
        },
        {
            "AbsEntry": 4927,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E17-2"
        },
        {
            "AbsEntry": 4928,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E17-3"
        },
        {
            "AbsEntry": 4930,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E18-1"
        },
        {
            "AbsEntry": 4931,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E18-2"
        },
        {
            "AbsEntry": 4932,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E18-3"
        },
        {
            "AbsEntry": 4934,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E19-1"
        },
        {
            "AbsEntry": 4935,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E19-2"
        },
        {
            "AbsEntry": 4936,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E19-3"
        },
        {
            "AbsEntry": 4938,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E20-1"
        },
        {
            "AbsEntry": 4939,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E20-2"
        },
        {
            "AbsEntry": 4940,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E20-3"
        },
        {
            "AbsEntry": 4942,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E21-1"
        },
        {
            "AbsEntry": 4943,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E21-2"
        },
        {
            "AbsEntry": 4944,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E21-3"
        },
        {
            "AbsEntry": 4946,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E22-1"
        },
        {
            "AbsEntry": 4947,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E22-2"
        },
        {
            "AbsEntry": 4948,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E22-3"
        },
        {
            "AbsEntry": 4950,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E23-1"
        },
        {
            "AbsEntry": 4951,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E23-2"
        },
        {
            "AbsEntry": 4952,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E23-3"
        },
        {
            "AbsEntry": 4954,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E24-1"
        },
        {
            "AbsEntry": 4955,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E24-2"
        },
        {
            "AbsEntry": 4956,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E24-3"
        },
        {
            "AbsEntry": 4958,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E25-1"
        },
        {
            "AbsEntry": 4959,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E25-2"
        },
        {
            "AbsEntry": 4960,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E25-3"
        },
        {
            "AbsEntry": 4962,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E26-1"
        },
        {
            "AbsEntry": 4963,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E26-2"
        },
        {
            "AbsEntry": 4964,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E26-3"
        },
        {
            "AbsEntry": 4966,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E27-1"
        },
        {
            "AbsEntry": 4967,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E27-2"
        },
        {
            "AbsEntry": 4968,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E27-3"
        },
        {
            "AbsEntry": 4970,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E28-1"
        },
        {
            "AbsEntry": 4971,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E28-2"
        },
        {
            "AbsEntry": 4972,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E28-3"
        },
        {
            "AbsEntry": 4974,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E29-1"
        },
        {
            "AbsEntry": 4975,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E29-2"
        },
        {
            "AbsEntry": 4976,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E29-3"
        },
        {
            "AbsEntry": 4978,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E30-1"
        },
        {
            "AbsEntry": 4979,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E30-2"
        },
        {
            "AbsEntry": 4980,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E30-3"
        },
        {
            "AbsEntry": 4982,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E31-1"
        },
        {
            "AbsEntry": 4983,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E31-2"
        },
        {
            "AbsEntry": 4984,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E31-3"
        },
        {
            "AbsEntry": 4986,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E32-1"
        },
        {
            "AbsEntry": 4987,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E32-2"
        },
        {
            "AbsEntry": 4988,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E32-3"
        },
        {
            "AbsEntry": 4990,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E33-1"
        },
        {
            "AbsEntry": 4991,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E33-2"
        },
        {
            "AbsEntry": 4992,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E33-3"
        },
        {
            "AbsEntry": 4994,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E34-1"
        },
        {
            "AbsEntry": 4995,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E34-2"
        },
        {
            "AbsEntry": 4996,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E34-3"
        },
        {
            "AbsEntry": 4998,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E35-1"
        },
        {
            "AbsEntry": 4999,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E35-2"
        },
        {
            "AbsEntry": 5000,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E35-3"
        },
        {
            "AbsEntry": 5002,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E36-1"
        },
        {
            "AbsEntry": 5003,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E36-2"
        },
        {
            "AbsEntry": 5004,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E36-3"
        },
        {
            "AbsEntry": 5006,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E37-1"
        },
        {
            "AbsEntry": 5007,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E37-2"
        },
        {
            "AbsEntry": 5008,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E37-3"
        },
        {
            "AbsEntry": 5010,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E38-1"
        },
        {
            "AbsEntry": 5011,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E38-2"
        },
        {
            "AbsEntry": 5012,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E38-3"
        },
        {
            "AbsEntry": 5014,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E39-1"
        },
        {
            "AbsEntry": 5015,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E39-2"
        },
        {
            "AbsEntry": 5016,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E39-3"
        },
        {
            "AbsEntry": 5018,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E40-1"
        },
        {
            "AbsEntry": 5019,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E40-2"
        },
        {
            "AbsEntry": 5020,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3E40-3"
        },
        {
            "AbsEntry": 5022,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F01-1"
        },
        {
            "AbsEntry": 5023,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F01-2"
        },
        {
            "AbsEntry": 5024,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F01-3"
        },
        {
            "AbsEntry": 5026,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F02-1"
        },
        {
            "AbsEntry": 5027,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F02-2"
        },
        {
            "AbsEntry": 5028,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F02-3"
        },
        {
            "AbsEntry": 5030,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F03-1"
        },
        {
            "AbsEntry": 5031,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F03-2"
        },
        {
            "AbsEntry": 5032,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F03-3"
        },
        {
            "AbsEntry": 5034,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F04-1"
        },
        {
            "AbsEntry": 5035,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F04-2"
        },
        {
            "AbsEntry": 5036,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F04-3"
        },
        {
            "AbsEntry": 5038,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F05-1"
        },
        {
            "AbsEntry": 5039,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F05-2"
        },
        {
            "AbsEntry": 5040,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F05-3"
        },
        {
            "AbsEntry": 5042,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F06-1"
        },
        {
            "AbsEntry": 5043,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F06-2"
        },
        {
            "AbsEntry": 5044,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F06-3"
        },
        {
            "AbsEntry": 5046,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F07-1"
        },
        {
            "AbsEntry": 5047,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F07-2"
        },
        {
            "AbsEntry": 5048,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F07-3"
        },
        {
            "AbsEntry": 5050,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F08-1"
        },
        {
            "AbsEntry": 5051,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F08-2"
        },
        {
            "AbsEntry": 5052,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F08-3"
        },
        {
            "AbsEntry": 5054,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F09-1"
        },
        {
            "AbsEntry": 5055,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F09-2"
        },
        {
            "AbsEntry": 5056,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F09-3"
        },
        {
            "AbsEntry": 5058,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F10-1"
        },
        {
            "AbsEntry": 5059,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F10-2"
        },
        {
            "AbsEntry": 5060,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F10-3"
        },
        {
            "AbsEntry": 5062,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F11-1"
        },
        {
            "AbsEntry": 5063,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F11-2"
        },
        {
            "AbsEntry": 5064,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F11-3"
        },
        {
            "AbsEntry": 5066,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F12-1"
        },
        {
            "AbsEntry": 5067,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F12-2"
        },
        {
            "AbsEntry": 5068,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F12-3"
        },
        {
            "AbsEntry": 5070,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F13-1"
        },
        {
            "AbsEntry": 5071,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F13-2"
        },
        {
            "AbsEntry": 5072,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F13-3"
        },
        {
            "AbsEntry": 5074,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F14-1"
        },
        {
            "AbsEntry": 5075,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F14-2"
        },
        {
            "AbsEntry": 5076,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F14-3"
        },
        {
            "AbsEntry": 5078,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F15-1"
        },
        {
            "AbsEntry": 5079,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F15-2"
        },
        {
            "AbsEntry": 5080,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F15-3"
        },
        {
            "AbsEntry": 5082,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F16-1"
        },
        {
            "AbsEntry": 5083,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F16-2"
        },
        {
            "AbsEntry": 5084,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F16-3"
        },
        {
            "AbsEntry": 5086,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F17-1"
        },
        {
            "AbsEntry": 5087,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F17-2"
        },
        {
            "AbsEntry": 5088,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F17-3"
        },
        {
            "AbsEntry": 5090,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F18-1"
        },
        {
            "AbsEntry": 5091,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F18-2"
        },
        {
            "AbsEntry": 5092,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F18-3"
        },
        {
            "AbsEntry": 5094,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F19-1"
        },
        {
            "AbsEntry": 5095,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F19-2"
        },
        {
            "AbsEntry": 5096,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F19-3"
        },
        {
            "AbsEntry": 5098,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F20-1"
        },
        {
            "AbsEntry": 5099,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F20-2"
        },
        {
            "AbsEntry": 5100,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F20-3"
        },
        {
            "AbsEntry": 5102,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F21-1"
        },
        {
            "AbsEntry": 5103,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F21-2"
        },
        {
            "AbsEntry": 5104,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F21-3"
        },
        {
            "AbsEntry": 5106,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F22-1"
        },
        {
            "AbsEntry": 5107,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F22-2"
        },
        {
            "AbsEntry": 5108,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F22-3"
        },
        {
            "AbsEntry": 5110,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F23-1"
        },
        {
            "AbsEntry": 5111,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F23-2"
        },
        {
            "AbsEntry": 5112,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F23-3"
        },
        {
            "AbsEntry": 5114,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F24-1"
        },
        {
            "AbsEntry": 5115,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F24-2"
        },
        {
            "AbsEntry": 5116,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F24-3"
        },
        {
            "AbsEntry": 5118,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F25-1"
        },
        {
            "AbsEntry": 5119,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F25-2"
        },
        {
            "AbsEntry": 5120,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F25-3"
        },
        {
            "AbsEntry": 5122,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F26-1"
        },
        {
            "AbsEntry": 5123,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F26-2"
        },
        {
            "AbsEntry": 5124,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F26-3"
        },
        {
            "AbsEntry": 5126,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F27-1"
        },
        {
            "AbsEntry": 5127,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F27-2"
        },
        {
            "AbsEntry": 5128,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F27-3"
        },
        {
            "AbsEntry": 5130,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F28-1"
        },
        {
            "AbsEntry": 5131,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F28-2"
        },
        {
            "AbsEntry": 5132,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F28-3"
        },
        {
            "AbsEntry": 5134,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F29-1"
        },
        {
            "AbsEntry": 5135,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F29-2"
        },
        {
            "AbsEntry": 5136,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F29-3"
        },
        {
            "AbsEntry": 5138,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F30-1"
        },
        {
            "AbsEntry": 5139,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F30-2"
        },
        {
            "AbsEntry": 5140,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F30-3"
        },
        {
            "AbsEntry": 5142,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F31-1"
        },
        {
            "AbsEntry": 5143,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F31-2"
        },
        {
            "AbsEntry": 5144,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F31-3"
        },
        {
            "AbsEntry": 5146,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F32-1"
        },
        {
            "AbsEntry": 5147,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F32-2"
        },
        {
            "AbsEntry": 5148,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F32-3"
        },
        {
            "AbsEntry": 5150,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F33-1"
        },
        {
            "AbsEntry": 5151,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F33-2"
        },
        {
            "AbsEntry": 5152,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F33-3"
        },
        {
            "AbsEntry": 5154,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F34-1"
        },
        {
            "AbsEntry": 5155,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F34-2"
        },
        {
            "AbsEntry": 5156,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F34-3"
        },
        {
            "AbsEntry": 5158,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F35-1"
        },
        {
            "AbsEntry": 5159,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F35-2"
        },
        {
            "AbsEntry": 5160,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F35-3"
        },
        {
            "AbsEntry": 5162,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F36-1"
        },
        {
            "AbsEntry": 5163,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F36-2"
        },
        {
            "AbsEntry": 5164,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F36-3"
        },
        {
            "AbsEntry": 5166,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F37-1"
        },
        {
            "AbsEntry": 5167,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F37-2"
        },
        {
            "AbsEntry": 5168,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F37-3"
        },
        {
            "AbsEntry": 5170,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F38-1"
        },
        {
            "AbsEntry": 5171,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F38-2"
        },
        {
            "AbsEntry": 5172,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F38-3"
        },
        {
            "AbsEntry": 5174,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F39-1"
        },
        {
            "AbsEntry": 5175,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F39-2"
        },
        {
            "AbsEntry": 5176,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F39-3"
        },
        {
            "AbsEntry": 5178,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F40-1"
        },
        {
            "AbsEntry": 5179,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F40-2"
        },
        {
            "AbsEntry": 5180,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3F40-3"
        },
        {
            "AbsEntry": 5182,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G01-1"
        },
        {
            "AbsEntry": 5183,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G01-2"
        },
        {
            "AbsEntry": 5184,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G01-3"
        },
        {
            "AbsEntry": 5186,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G02-1"
        },
        {
            "AbsEntry": 5187,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G02-2"
        },
        {
            "AbsEntry": 5188,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G02-3"
        },
        {
            "AbsEntry": 5190,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G03-1"
        },
        {
            "AbsEntry": 5191,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G03-2"
        },
        {
            "AbsEntry": 5192,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G03-3"
        },
        {
            "AbsEntry": 5194,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G04-1"
        },
        {
            "AbsEntry": 5195,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G04-2"
        },
        {
            "AbsEntry": 5196,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G04-3"
        },
        {
            "AbsEntry": 5198,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G05-1"
        },
        {
            "AbsEntry": 5199,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G05-2"
        },
        {
            "AbsEntry": 5200,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G05-3"
        },
        {
            "AbsEntry": 5202,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G06-1"
        },
        {
            "AbsEntry": 5203,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G06-2"
        },
        {
            "AbsEntry": 5204,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G06-3"
        },
        {
            "AbsEntry": 5206,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G07-1"
        },
        {
            "AbsEntry": 5207,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G07-2"
        },
        {
            "AbsEntry": 5208,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G07-3"
        },
        {
            "AbsEntry": 5210,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G08-1"
        },
        {
            "AbsEntry": 5211,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G08-2"
        },
        {
            "AbsEntry": 5212,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G08-3"
        },
        {
            "AbsEntry": 5214,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G09-1"
        },
        {
            "AbsEntry": 5215,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G09-2"
        },
        {
            "AbsEntry": 5216,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G09-3"
        },
        {
            "AbsEntry": 5218,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G10-1"
        },
        {
            "AbsEntry": 5219,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G10-2"
        },
        {
            "AbsEntry": 5220,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G10-3"
        },
        {
            "AbsEntry": 5222,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G11-1"
        },
        {
            "AbsEntry": 5223,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G11-2"
        },
        {
            "AbsEntry": 5224,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G11-3"
        },
        {
            "AbsEntry": 5226,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G12-1"
        },
        {
            "AbsEntry": 5227,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G12-2"
        },
        {
            "AbsEntry": 5228,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G12-3"
        },
        {
            "AbsEntry": 5230,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G13-1"
        },
        {
            "AbsEntry": 5231,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G13-2"
        },
        {
            "AbsEntry": 5232,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G13-3"
        },
        {
            "AbsEntry": 5234,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G14-1"
        },
        {
            "AbsEntry": 5235,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G14-2"
        },
        {
            "AbsEntry": 5236,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G14-3"
        },
        {
            "AbsEntry": 5238,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G15-1"
        },
        {
            "AbsEntry": 5239,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G15-2"
        },
        {
            "AbsEntry": 5240,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G15-3"
        },
        {
            "AbsEntry": 5242,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G16-1"
        },
        {
            "AbsEntry": 5243,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G16-2"
        },
        {
            "AbsEntry": 5244,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G16-3"
        },
        {
            "AbsEntry": 5246,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G17-1"
        },
        {
            "AbsEntry": 5247,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G17-2"
        },
        {
            "AbsEntry": 5248,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G17-3"
        },
        {
            "AbsEntry": 5250,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G18-1"
        },
        {
            "AbsEntry": 5251,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G18-2"
        },
        {
            "AbsEntry": 5252,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G18-3"
        },
        {
            "AbsEntry": 5254,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G19-1"
        },
        {
            "AbsEntry": 5255,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G19-2"
        },
        {
            "AbsEntry": 5256,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G19-3"
        },
        {
            "AbsEntry": 5258,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G20-1"
        },
        {
            "AbsEntry": 5259,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G20-2"
        },
        {
            "AbsEntry": 5260,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G20-3"
        },
        {
            "AbsEntry": 5262,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G21-1"
        },
        {
            "AbsEntry": 5263,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G21-2"
        },
        {
            "AbsEntry": 5264,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G21-3"
        },
        {
            "AbsEntry": 5266,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G22-1"
        },
        {
            "AbsEntry": 5267,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G22-2"
        },
        {
            "AbsEntry": 5268,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G22-3"
        },
        {
            "AbsEntry": 5270,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G23-1"
        },
        {
            "AbsEntry": 5271,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G23-2"
        },
        {
            "AbsEntry": 5272,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G23-3"
        },
        {
            "AbsEntry": 5274,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G24-1"
        },
        {
            "AbsEntry": 5275,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G24-2"
        },
        {
            "AbsEntry": 5276,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G24-3"
        },
        {
            "AbsEntry": 5278,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G25-1"
        },
        {
            "AbsEntry": 5279,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G25-2"
        },
        {
            "AbsEntry": 5280,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G25-3"
        },
        {
            "AbsEntry": 5282,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G26-1"
        },
        {
            "AbsEntry": 5283,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G26-2"
        },
        {
            "AbsEntry": 5284,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G26-3"
        },
        {
            "AbsEntry": 5286,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G27-1"
        },
        {
            "AbsEntry": 5287,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G27-2"
        },
        {
            "AbsEntry": 5288,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G27-3"
        },
        {
            "AbsEntry": 5290,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G28-1"
        },
        {
            "AbsEntry": 5291,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G28-2"
        },
        {
            "AbsEntry": 5292,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G28-3"
        },
        {
            "AbsEntry": 5294,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G29-1"
        },
        {
            "AbsEntry": 5295,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G29-2"
        },
        {
            "AbsEntry": 5296,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G29-3"
        },
        {
            "AbsEntry": 5298,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G30-1"
        },
        {
            "AbsEntry": 5299,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G30-2"
        },
        {
            "AbsEntry": 5300,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G30-3"
        },
        {
            "AbsEntry": 5302,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G31-1"
        },
        {
            "AbsEntry": 5303,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G31-2"
        },
        {
            "AbsEntry": 5304,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G31-3"
        },
        {
            "AbsEntry": 5306,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G32-1"
        },
        {
            "AbsEntry": 5307,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G32-2"
        },
        {
            "AbsEntry": 5308,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G32-3"
        },
        {
            "AbsEntry": 5310,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G33-1"
        },
        {
            "AbsEntry": 5311,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G33-2"
        },
        {
            "AbsEntry": 5312,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G33-3"
        },
        {
            "AbsEntry": 5314,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G34-1"
        },
        {
            "AbsEntry": 5315,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G34-2"
        },
        {
            "AbsEntry": 5316,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G34-3"
        },
        {
            "AbsEntry": 5318,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G35-1"
        },
        {
            "AbsEntry": 5319,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G35-2"
        },
        {
            "AbsEntry": 5320,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G35-3"
        },
        {
            "AbsEntry": 5322,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G36-1"
        },
        {
            "AbsEntry": 5323,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G36-2"
        },
        {
            "AbsEntry": 5324,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G36-3"
        },
        {
            "AbsEntry": 5326,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G37-1"
        },
        {
            "AbsEntry": 5327,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G37-2"
        },
        {
            "AbsEntry": 5328,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G37-3"
        },
        {
            "AbsEntry": 5330,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G38-1"
        },
        {
            "AbsEntry": 5331,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G38-2"
        },
        {
            "AbsEntry": 5332,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G38-3"
        },
        {
            "AbsEntry": 5334,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G39-1"
        },
        {
            "AbsEntry": 5335,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G39-2"
        },
        {
            "AbsEntry": 5336,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G39-3"
        },
        {
            "AbsEntry": 5338,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G40-1"
        },
        {
            "AbsEntry": 5339,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G40-2"
        },
        {
            "AbsEntry": 5340,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3G40-3"
        },
        {
            "AbsEntry": 5342,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H01-1"
        },
        {
            "AbsEntry": 5343,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H01-2"
        },
        {
            "AbsEntry": 5344,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H01-3"
        },
        {
            "AbsEntry": 5346,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H02-1"
        },
        {
            "AbsEntry": 5347,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H02-2"
        },
        {
            "AbsEntry": 5348,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H02-3"
        },
        {
            "AbsEntry": 5350,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H03-1"
        },
        {
            "AbsEntry": 5351,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H03-2"
        },
        {
            "AbsEntry": 5352,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H03-3"
        },
        {
            "AbsEntry": 5354,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H04-1"
        },
        {
            "AbsEntry": 5355,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H04-2"
        },
        {
            "AbsEntry": 5356,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H04-3"
        },
        {
            "AbsEntry": 5358,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H05-1"
        },
        {
            "AbsEntry": 5359,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H05-2"
        },
        {
            "AbsEntry": 5360,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H05-3"
        },
        {
            "AbsEntry": 5362,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H06-1"
        },
        {
            "AbsEntry": 5363,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H06-2"
        },
        {
            "AbsEntry": 5364,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H06-3"
        },
        {
            "AbsEntry": 5366,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H07-1"
        },
        {
            "AbsEntry": 5367,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H07-2"
        },
        {
            "AbsEntry": 5368,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H07-3"
        },
        {
            "AbsEntry": 5370,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H08-1"
        },
        {
            "AbsEntry": 5371,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H08-2"
        },
        {
            "AbsEntry": 5372,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H08-3"
        },
        {
            "AbsEntry": 5374,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H09-1"
        },
        {
            "AbsEntry": 5375,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H09-2"
        },
        {
            "AbsEntry": 5376,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H09-3"
        },
        {
            "AbsEntry": 5378,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H10-1"
        },
        {
            "AbsEntry": 5379,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H10-2"
        },
        {
            "AbsEntry": 5380,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H10-3"
        },
        {
            "AbsEntry": 5382,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H11-1"
        },
        {
            "AbsEntry": 5383,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H11-2"
        },
        {
            "AbsEntry": 5384,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H11-3"
        },
        {
            "AbsEntry": 5386,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H12-1"
        },
        {
            "AbsEntry": 5387,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H12-2"
        },
        {
            "AbsEntry": 5388,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H12-3"
        },
        {
            "AbsEntry": 5390,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H13-1"
        },
        {
            "AbsEntry": 5391,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H13-2"
        },
        {
            "AbsEntry": 5392,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H13-3"
        },
        {
            "AbsEntry": 5394,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H14-1"
        },
        {
            "AbsEntry": 5395,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H14-2"
        },
        {
            "AbsEntry": 5396,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H14-3"
        },
        {
            "AbsEntry": 5398,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H15-1"
        },
        {
            "AbsEntry": 5399,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H15-2"
        },
        {
            "AbsEntry": 5400,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H15-3"
        },
        {
            "AbsEntry": 5402,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H16-1"
        },
        {
            "AbsEntry": 5403,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H16-2"
        },
        {
            "AbsEntry": 5404,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H16-3"
        },
        {
            "AbsEntry": 5406,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H17-1"
        },
        {
            "AbsEntry": 5407,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H17-2"
        },
        {
            "AbsEntry": 5408,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H17-3"
        },
        {
            "AbsEntry": 5410,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H18-1"
        },
        {
            "AbsEntry": 5411,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H18-2"
        },
        {
            "AbsEntry": 5412,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H18-3"
        },
        {
            "AbsEntry": 5414,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H19-1"
        },
        {
            "AbsEntry": 5415,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H19-2"
        },
        {
            "AbsEntry": 5416,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H19-3"
        },
        {
            "AbsEntry": 5418,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H20-1"
        },
        {
            "AbsEntry": 5419,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H20-2"
        },
        {
            "AbsEntry": 5420,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H20-3"
        },
        {
            "AbsEntry": 5422,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H21-1"
        },
        {
            "AbsEntry": 5423,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H21-2"
        },
        {
            "AbsEntry": 5424,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H21-3"
        },
        {
            "AbsEntry": 5426,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H22-1"
        },
        {
            "AbsEntry": 5427,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H22-2"
        },
        {
            "AbsEntry": 5428,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H22-3"
        },
        {
            "AbsEntry": 5430,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H23-1"
        },
        {
            "AbsEntry": 5431,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H23-2"
        },
        {
            "AbsEntry": 5432,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H23-3"
        },
        {
            "AbsEntry": 5434,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H24-1"
        },
        {
            "AbsEntry": 5435,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H24-2"
        },
        {
            "AbsEntry": 5436,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H24-3"
        },
        {
            "AbsEntry": 5438,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H25-1"
        },
        {
            "AbsEntry": 5439,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H25-2"
        },
        {
            "AbsEntry": 5440,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H25-3"
        },
        {
            "AbsEntry": 5442,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H26-1"
        },
        {
            "AbsEntry": 5443,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H26-2"
        },
        {
            "AbsEntry": 5444,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H26-3"
        },
        {
            "AbsEntry": 5446,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H27-1"
        },
        {
            "AbsEntry": 5447,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H27-2"
        },
        {
            "AbsEntry": 5448,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H27-3"
        },
        {
            "AbsEntry": 5450,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H28-1"
        },
        {
            "AbsEntry": 5451,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H28-2"
        },
        {
            "AbsEntry": 5452,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H28-3"
        },
        {
            "AbsEntry": 5454,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H29-1"
        },
        {
            "AbsEntry": 5455,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H29-2"
        },
        {
            "AbsEntry": 5456,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H29-3"
        },
        {
            "AbsEntry": 5458,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H30-1"
        },
        {
            "AbsEntry": 5459,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H30-2"
        },
        {
            "AbsEntry": 5460,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H30-3"
        },
        {
            "AbsEntry": 5462,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H31-1"
        },
        {
            "AbsEntry": 5463,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H31-2"
        },
        {
            "AbsEntry": 5464,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H31-3"
        },
        {
            "AbsEntry": 5466,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H32-1"
        },
        {
            "AbsEntry": 5467,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H32-2"
        },
        {
            "AbsEntry": 5468,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H32-3"
        },
        {
            "AbsEntry": 5470,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H33-1"
        },
        {
            "AbsEntry": 5471,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H33-2"
        },
        {
            "AbsEntry": 5472,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H33-3"
        },
        {
            "AbsEntry": 5474,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H34-1"
        },
        {
            "AbsEntry": 5475,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H34-2"
        },
        {
            "AbsEntry": 5476,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H34-3"
        },
        {
            "AbsEntry": 5478,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H35-1"
        },
        {
            "AbsEntry": 5479,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H35-2"
        },
        {
            "AbsEntry": 5480,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H35-3"
        },
        {
            "AbsEntry": 5482,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H36-1"
        },
        {
            "AbsEntry": 5483,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H36-2"
        },
        {
            "AbsEntry": 5484,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H36-3"
        },
        {
            "AbsEntry": 5486,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H37-1"
        },
        {
            "AbsEntry": 5487,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H37-2"
        },
        {
            "AbsEntry": 5488,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H37-3"
        },
        {
            "AbsEntry": 5490,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H38-1"
        },
        {
            "AbsEntry": 5491,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H38-2"
        },
        {
            "AbsEntry": 5492,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H38-3"
        },
        {
            "AbsEntry": 5494,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H39-1"
        },
        {
            "AbsEntry": 5495,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H39-2"
        },
        {
            "AbsEntry": 5496,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H39-3"
        },
        {
            "AbsEntry": 5498,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H40-1"
        },
        {
            "AbsEntry": 5499,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H40-2"
        },
        {
            "AbsEntry": 5500,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3H40-3"
        },
        {
            "AbsEntry": 5502,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I01-1"
        },
        {
            "AbsEntry": 5503,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I01-2"
        },
        {
            "AbsEntry": 5504,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I01-3"
        },
        {
            "AbsEntry": 5506,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I02-1"
        },
        {
            "AbsEntry": 5507,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I02-2"
        },
        {
            "AbsEntry": 5508,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I02-3"
        },
        {
            "AbsEntry": 5510,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I03-1"
        },
        {
            "AbsEntry": 5511,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I03-2"
        },
        {
            "AbsEntry": 5512,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I03-3"
        },
        {
            "AbsEntry": 5514,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I04-1"
        },
        {
            "AbsEntry": 5515,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I04-2"
        },
        {
            "AbsEntry": 5516,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I04-3"
        },
        {
            "AbsEntry": 5518,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I05-1"
        },
        {
            "AbsEntry": 5519,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I05-2"
        },
        {
            "AbsEntry": 5520,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I05-3"
        },
        {
            "AbsEntry": 5522,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I06-1"
        },
        {
            "AbsEntry": 5523,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I06-2"
        },
        {
            "AbsEntry": 5524,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I06-3"
        },
        {
            "AbsEntry": 5526,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I07-1"
        },
        {
            "AbsEntry": 5527,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I07-2"
        },
        {
            "AbsEntry": 5528,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I07-3"
        },
        {
            "AbsEntry": 5530,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I08-1"
        },
        {
            "AbsEntry": 5531,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I08-2"
        },
        {
            "AbsEntry": 5532,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I08-3"
        },
        {
            "AbsEntry": 5534,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I09-1"
        },
        {
            "AbsEntry": 5535,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I09-2"
        },
        {
            "AbsEntry": 5536,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I09-3"
        },
        {
            "AbsEntry": 5538,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I10-1"
        },
        {
            "AbsEntry": 5539,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I10-2"
        },
        {
            "AbsEntry": 5540,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I10-3"
        },
        {
            "AbsEntry": 5542,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I11-1"
        },
        {
            "AbsEntry": 5543,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I11-2"
        },
        {
            "AbsEntry": 5544,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I11-3"
        },
        {
            "AbsEntry": 5546,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I12-1"
        },
        {
            "AbsEntry": 5547,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I12-2"
        },
        {
            "AbsEntry": 5548,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I12-3"
        },
        {
            "AbsEntry": 5550,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I13-1"
        },
        {
            "AbsEntry": 5551,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I13-2"
        },
        {
            "AbsEntry": 5552,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I13-3"
        },
        {
            "AbsEntry": 5554,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I14-1"
        },
        {
            "AbsEntry": 5555,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I14-2"
        },
        {
            "AbsEntry": 5556,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I14-3"
        },
        {
            "AbsEntry": 5558,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I15-1"
        },
        {
            "AbsEntry": 5559,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I15-2"
        },
        {
            "AbsEntry": 5560,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I15-3"
        },
        {
            "AbsEntry": 5562,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I16-1"
        },
        {
            "AbsEntry": 5563,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I16-2"
        },
        {
            "AbsEntry": 5564,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I16-3"
        },
        {
            "AbsEntry": 5566,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I17-1"
        },
        {
            "AbsEntry": 5567,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I17-2"
        },
        {
            "AbsEntry": 5568,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I17-3"
        },
        {
            "AbsEntry": 5570,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I18-1"
        },
        {
            "AbsEntry": 5571,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I18-2"
        },
        {
            "AbsEntry": 5572,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I18-3"
        },
        {
            "AbsEntry": 5574,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I19-1"
        },
        {
            "AbsEntry": 5575,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I19-2"
        },
        {
            "AbsEntry": 5576,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I19-3"
        },
        {
            "AbsEntry": 5578,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I20-1"
        },
        {
            "AbsEntry": 5579,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I20-2"
        },
        {
            "AbsEntry": 5580,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I20-3"
        },
        {
            "AbsEntry": 5582,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I21-1"
        },
        {
            "AbsEntry": 5583,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I21-2"
        },
        {
            "AbsEntry": 5584,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I21-3"
        },
        {
            "AbsEntry": 5586,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I22-1"
        },
        {
            "AbsEntry": 5587,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I22-2"
        },
        {
            "AbsEntry": 5588,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I22-3"
        },
        {
            "AbsEntry": 5590,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I23-1"
        },
        {
            "AbsEntry": 5591,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I23-2"
        },
        {
            "AbsEntry": 5592,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I23-3"
        },
        {
            "AbsEntry": 5594,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I24-1"
        },
        {
            "AbsEntry": 5595,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I24-2"
        },
        {
            "AbsEntry": 5596,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I24-3"
        },
        {
            "AbsEntry": 5598,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I25-1"
        },
        {
            "AbsEntry": 5599,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I25-2"
        },
        {
            "AbsEntry": 5600,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I25-3"
        },
        {
            "AbsEntry": 5602,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I26-1"
        },
        {
            "AbsEntry": 5603,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I26-2"
        },
        {
            "AbsEntry": 5604,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I26-3"
        },
        {
            "AbsEntry": 5606,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I27-1"
        },
        {
            "AbsEntry": 5607,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I27-2"
        },
        {
            "AbsEntry": 5608,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I27-3"
        },
        {
            "AbsEntry": 5610,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I28-1"
        },
        {
            "AbsEntry": 5611,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I28-2"
        },
        {
            "AbsEntry": 5612,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I28-3"
        },
        {
            "AbsEntry": 5614,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I29-1"
        },
        {
            "AbsEntry": 5615,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I29-2"
        },
        {
            "AbsEntry": 5616,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I29-3"
        },
        {
            "AbsEntry": 5618,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I30-1"
        },
        {
            "AbsEntry": 5619,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I30-2"
        },
        {
            "AbsEntry": 5620,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I30-3"
        },
        {
            "AbsEntry": 5622,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I31-1"
        },
        {
            "AbsEntry": 5623,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I31-2"
        },
        {
            "AbsEntry": 5624,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I31-3"
        },
        {
            "AbsEntry": 5626,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I32-1"
        },
        {
            "AbsEntry": 5627,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I32-2"
        },
        {
            "AbsEntry": 5628,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I32-3"
        },
        {
            "AbsEntry": 5630,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I33-1"
        },
        {
            "AbsEntry": 5631,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I33-2"
        },
        {
            "AbsEntry": 5632,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I33-3"
        },
        {
            "AbsEntry": 5634,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I34-1"
        },
        {
            "AbsEntry": 5635,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I34-2"
        },
        {
            "AbsEntry": 5636,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I34-3"
        },
        {
            "AbsEntry": 5638,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I35-1"
        },
        {
            "AbsEntry": 5639,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I35-2"
        },
        {
            "AbsEntry": 5640,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I35-3"
        },
        {
            "AbsEntry": 5642,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I36-1"
        },
        {
            "AbsEntry": 5643,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I36-2"
        },
        {
            "AbsEntry": 5644,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I36-3"
        },
        {
            "AbsEntry": 5646,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I37-1"
        },
        {
            "AbsEntry": 5647,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I37-2"
        },
        {
            "AbsEntry": 5648,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I37-3"
        },
        {
            "AbsEntry": 5650,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I38-1"
        },
        {
            "AbsEntry": 5651,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I38-2"
        },
        {
            "AbsEntry": 5652,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I38-3"
        },
        {
            "AbsEntry": 5654,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I39-1"
        },
        {
            "AbsEntry": 5655,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I39-2"
        },
        {
            "AbsEntry": 5656,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I39-3"
        },
        {
            "AbsEntry": 5658,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I40-1"
        },
        {
            "AbsEntry": 5659,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I40-2"
        },
        {
            "AbsEntry": 5660,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3I40-3"
        },
        {
            "AbsEntry": 5662,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J01-1"
        },
        {
            "AbsEntry": 5663,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J01-2"
        },
        {
            "AbsEntry": 5664,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J01-3"
        },
        {
            "AbsEntry": 5666,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J02-1"
        },
        {
            "AbsEntry": 5667,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J02-2"
        },
        {
            "AbsEntry": 5668,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J02-3"
        },
        {
            "AbsEntry": 5670,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J03-1"
        },
        {
            "AbsEntry": 5671,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J03-2"
        },
        {
            "AbsEntry": 5672,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J03-3"
        },
        {
            "AbsEntry": 5674,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J04-1"
        },
        {
            "AbsEntry": 5675,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J04-2"
        },
        {
            "AbsEntry": 5676,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J04-3"
        },
        {
            "AbsEntry": 5678,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J05-1"
        },
        {
            "AbsEntry": 5679,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J05-2"
        },
        {
            "AbsEntry": 5680,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J05-3"
        },
        {
            "AbsEntry": 5682,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J06-1"
        },
        {
            "AbsEntry": 5683,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J06-2"
        },
        {
            "AbsEntry": 5684,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J06-3"
        },
        {
            "AbsEntry": 5686,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J07-1"
        },
        {
            "AbsEntry": 5687,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J07-2"
        },
        {
            "AbsEntry": 5688,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J07-3"
        },
        {
            "AbsEntry": 5690,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J08-1"
        },
        {
            "AbsEntry": 5691,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J08-2"
        },
        {
            "AbsEntry": 5692,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J08-3"
        },
        {
            "AbsEntry": 5694,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J09-1"
        },
        {
            "AbsEntry": 5695,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J09-2"
        },
        {
            "AbsEntry": 5696,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J09-3"
        },
        {
            "AbsEntry": 5698,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J10-1"
        },
        {
            "AbsEntry": 5699,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J10-2"
        },
        {
            "AbsEntry": 5700,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J10-3"
        },
        {
            "AbsEntry": 5702,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J11-1"
        },
        {
            "AbsEntry": 5703,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J11-2"
        },
        {
            "AbsEntry": 5704,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J11-3"
        },
        {
            "AbsEntry": 5706,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J12-1"
        },
        {
            "AbsEntry": 5707,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J12-2"
        },
        {
            "AbsEntry": 5708,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J12-3"
        },
        {
            "AbsEntry": 5710,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J13-1"
        },
        {
            "AbsEntry": 5711,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J13-2"
        },
        {
            "AbsEntry": 5712,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J13-3"
        },
        {
            "AbsEntry": 5714,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J14-1"
        },
        {
            "AbsEntry": 5715,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J14-2"
        },
        {
            "AbsEntry": 5716,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J14-3"
        },
        {
            "AbsEntry": 5718,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J15-1"
        },
        {
            "AbsEntry": 5719,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J15-2"
        },
        {
            "AbsEntry": 5720,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J15-3"
        },
        {
            "AbsEntry": 5722,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J16-1"
        },
        {
            "AbsEntry": 5723,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J16-2"
        },
        {
            "AbsEntry": 5724,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J16-3"
        },
        {
            "AbsEntry": 5726,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J17-1"
        },
        {
            "AbsEntry": 5727,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J17-2"
        },
        {
            "AbsEntry": 5728,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J17-3"
        },
        {
            "AbsEntry": 5730,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J18-1"
        },
        {
            "AbsEntry": 5731,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J18-2"
        },
        {
            "AbsEntry": 5732,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J18-3"
        },
        {
            "AbsEntry": 5734,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J19-1"
        },
        {
            "AbsEntry": 5735,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J19-2"
        },
        {
            "AbsEntry": 5736,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J19-3"
        },
        {
            "AbsEntry": 5738,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J20-1"
        },
        {
            "AbsEntry": 5739,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J20-2"
        },
        {
            "AbsEntry": 5740,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J20-3"
        },
        {
            "AbsEntry": 5742,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J21-1"
        },
        {
            "AbsEntry": 5743,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J21-2"
        },
        {
            "AbsEntry": 5744,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J21-3"
        },
        {
            "AbsEntry": 5746,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J22-1"
        },
        {
            "AbsEntry": 5747,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J22-2"
        },
        {
            "AbsEntry": 5748,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J22-3"
        },
        {
            "AbsEntry": 5750,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J23-1"
        },
        {
            "AbsEntry": 5751,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J23-2"
        },
        {
            "AbsEntry": 5752,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J23-3"
        },
        {
            "AbsEntry": 5754,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J24-1"
        },
        {
            "AbsEntry": 5755,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J24-2"
        },
        {
            "AbsEntry": 5756,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J24-3"
        },
        {
            "AbsEntry": 5758,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J25-1"
        },
        {
            "AbsEntry": 5759,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J25-2"
        },
        {
            "AbsEntry": 5760,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J25-3"
        },
        {
            "AbsEntry": 5762,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J26-1"
        },
        {
            "AbsEntry": 5763,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J26-2"
        },
        {
            "AbsEntry": 5764,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J26-3"
        },
        {
            "AbsEntry": 5766,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J27-1"
        },
        {
            "AbsEntry": 5767,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J27-2"
        },
        {
            "AbsEntry": 5768,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J27-3"
        },
        {
            "AbsEntry": 5770,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J28-1"
        },
        {
            "AbsEntry": 5771,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J28-2"
        },
        {
            "AbsEntry": 5772,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J28-3"
        },
        {
            "AbsEntry": 5774,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J29-1"
        },
        {
            "AbsEntry": 5775,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J29-2"
        },
        {
            "AbsEntry": 5776,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J29-3"
        },
        {
            "AbsEntry": 5778,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J30-1"
        },
        {
            "AbsEntry": 5779,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J30-2"
        },
        {
            "AbsEntry": 5780,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J30-3"
        },
        {
            "AbsEntry": 5782,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J31-1"
        },
        {
            "AbsEntry": 5783,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J31-2"
        },
        {
            "AbsEntry": 5784,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J31-3"
        },
        {
            "AbsEntry": 5786,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J32-1"
        },
        {
            "AbsEntry": 5787,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J32-2"
        },
        {
            "AbsEntry": 5788,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J32-3"
        },
        {
            "AbsEntry": 5790,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J33-1"
        },
        {
            "AbsEntry": 5791,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J33-2"
        },
        {
            "AbsEntry": 5792,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J33-3"
        },
        {
            "AbsEntry": 5794,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J34-1"
        },
        {
            "AbsEntry": 5795,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J34-2"
        },
        {
            "AbsEntry": 5796,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J34-3"
        },
        {
            "AbsEntry": 5798,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J35-1"
        },
        {
            "AbsEntry": 5799,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J35-2"
        },
        {
            "AbsEntry": 5800,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J35-3"
        },
        {
            "AbsEntry": 5802,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J36-1"
        },
        {
            "AbsEntry": 5803,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J36-2"
        },
        {
            "AbsEntry": 5804,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J36-3"
        },
        {
            "AbsEntry": 5806,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J37-1"
        },
        {
            "AbsEntry": 5807,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J37-2"
        },
        {
            "AbsEntry": 5808,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J37-3"
        },
        {
            "AbsEntry": 5810,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J38-1"
        },
        {
            "AbsEntry": 5811,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J38-2"
        },
        {
            "AbsEntry": 5812,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J38-3"
        },
        {
            "AbsEntry": 5814,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J39-1"
        },
        {
            "AbsEntry": 5815,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J39-2"
        },
        {
            "AbsEntry": 5816,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J39-3"
        },
        {
            "AbsEntry": 5818,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J40-1"
        },
        {
            "AbsEntry": 5819,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J40-2"
        },
        {
            "AbsEntry": 5820,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J40-3"
        },
        {
            "AbsEntry": 5822,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J41-1"
        },
        {
            "AbsEntry": 5823,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J41-2"
        },
        {
            "AbsEntry": 5824,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J41-3"
        },
        {
            "AbsEntry": 5826,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J42-1"
        },
        {
            "AbsEntry": 5827,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J42-2"
        },
        {
            "AbsEntry": 5828,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J42-3"
        },
        {
            "AbsEntry": 5830,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J43-1"
        },
        {
            "AbsEntry": 5831,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J43-2"
        },
        {
            "AbsEntry": 5832,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J43-3"
        },
        {
            "AbsEntry": 5834,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J44-1"
        },
        {
            "AbsEntry": 5835,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J44-2"
        },
        {
            "AbsEntry": 5836,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J44-3"
        },
        {
            "AbsEntry": 5838,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J45-1"
        },
        {
            "AbsEntry": 5839,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J45-2"
        },
        {
            "AbsEntry": 5840,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J45-3"
        },
        {
            "AbsEntry": 5842,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J46-1"
        },
        {
            "AbsEntry": 5843,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J46-2"
        },
        {
            "AbsEntry": 5844,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J46-3"
        },
        {
            "AbsEntry": 5846,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J47-1"
        },
        {
            "AbsEntry": 5847,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J47-2"
        },
        {
            "AbsEntry": 5848,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J47-3"
        },
        {
            "AbsEntry": 5850,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J48-1"
        },
        {
            "AbsEntry": 5851,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J48-2"
        },
        {
            "AbsEntry": 5852,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3J48-3"
        },
        {
            "AbsEntry": 5854,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K01-1"
        },
        {
            "AbsEntry": 5855,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K01-2"
        },
        {
            "AbsEntry": 5856,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K01-3"
        },
        {
            "AbsEntry": 5858,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K02-1"
        },
        {
            "AbsEntry": 5859,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K02-2"
        },
        {
            "AbsEntry": 5860,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K02-3"
        },
        {
            "AbsEntry": 5862,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K03-1"
        },
        {
            "AbsEntry": 5863,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K03-2"
        },
        {
            "AbsEntry": 5864,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K03-3"
        },
        {
            "AbsEntry": 5866,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K04-1"
        },
        {
            "AbsEntry": 5867,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K04-2"
        },
        {
            "AbsEntry": 5868,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K04-3"
        },
        {
            "AbsEntry": 5870,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K05-1"
        },
        {
            "AbsEntry": 5871,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K05-2"
        },
        {
            "AbsEntry": 5872,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K05-3"
        },
        {
            "AbsEntry": 5874,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K06-1"
        },
        {
            "AbsEntry": 5875,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K06-2"
        },
        {
            "AbsEntry": 5876,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K06-3"
        },
        {
            "AbsEntry": 5878,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K07-1"
        },
        {
            "AbsEntry": 5879,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K07-2"
        },
        {
            "AbsEntry": 5880,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K07-3"
        },
        {
            "AbsEntry": 5882,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K08-1"
        },
        {
            "AbsEntry": 5883,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K08-2"
        },
        {
            "AbsEntry": 5884,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K08-3"
        },
        {
            "AbsEntry": 5886,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K09-1"
        },
        {
            "AbsEntry": 5887,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K09-2"
        },
        {
            "AbsEntry": 5888,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K09-3"
        },
        {
            "AbsEntry": 5890,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K10-1"
        },
        {
            "AbsEntry": 5891,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K10-2"
        },
        {
            "AbsEntry": 5892,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K10-3"
        },
        {
            "AbsEntry": 5894,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K11-1"
        },
        {
            "AbsEntry": 5895,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K11-2"
        },
        {
            "AbsEntry": 5896,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K11-3"
        },
        {
            "AbsEntry": 5898,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K12-1"
        },
        {
            "AbsEntry": 5899,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K12-2"
        },
        {
            "AbsEntry": 5900,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K12-3"
        },
        {
            "AbsEntry": 5902,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K13-1"
        },
        {
            "AbsEntry": 5903,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K13-2"
        },
        {
            "AbsEntry": 5904,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K13-3"
        },
        {
            "AbsEntry": 5906,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K14-1"
        },
        {
            "AbsEntry": 5907,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K14-2"
        },
        {
            "AbsEntry": 5908,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K14-3"
        },
        {
            "AbsEntry": 5910,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K15-1"
        },
        {
            "AbsEntry": 5911,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K15-2"
        },
        {
            "AbsEntry": 5912,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K15-3"
        },
        {
            "AbsEntry": 5914,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K16-1"
        },
        {
            "AbsEntry": 5915,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K16-2"
        },
        {
            "AbsEntry": 5916,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K16-3"
        },
        {
            "AbsEntry": 5918,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K17-1"
        },
        {
            "AbsEntry": 5919,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K17-2"
        },
        {
            "AbsEntry": 5920,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K17-3"
        },
        {
            "AbsEntry": 5922,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K18-1"
        },
        {
            "AbsEntry": 5923,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K18-2"
        },
        {
            "AbsEntry": 5924,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K18-3"
        },
        {
            "AbsEntry": 5926,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K19-1"
        },
        {
            "AbsEntry": 5927,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K19-2"
        },
        {
            "AbsEntry": 5928,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K19-3"
        },
        {
            "AbsEntry": 5930,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K20-1"
        },
        {
            "AbsEntry": 5931,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K20-2"
        },
        {
            "AbsEntry": 5932,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K20-3"
        },
        {
            "AbsEntry": 5934,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K21-1"
        },
        {
            "AbsEntry": 5935,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K21-2"
        },
        {
            "AbsEntry": 5936,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K21-3"
        },
        {
            "AbsEntry": 5938,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K22-1"
        },
        {
            "AbsEntry": 5939,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K22-2"
        },
        {
            "AbsEntry": 5940,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K22-3"
        },
        {
            "AbsEntry": 5942,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K23-1"
        },
        {
            "AbsEntry": 5943,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K23-2"
        },
        {
            "AbsEntry": 5944,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K23-3"
        },
        {
            "AbsEntry": 5946,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K24-1"
        },
        {
            "AbsEntry": 5947,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K24-2"
        },
        {
            "AbsEntry": 5948,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K24-3"
        },
        {
            "AbsEntry": 5950,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K25-1"
        },
        {
            "AbsEntry": 5951,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K25-2"
        },
        {
            "AbsEntry": 5952,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K25-3"
        },
        {
            "AbsEntry": 5954,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K26-1"
        },
        {
            "AbsEntry": 5955,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K26-2"
        },
        {
            "AbsEntry": 5956,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K26-3"
        },
        {
            "AbsEntry": 5958,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K27-1"
        },
        {
            "AbsEntry": 5959,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K27-2"
        },
        {
            "AbsEntry": 5960,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K27-3"
        },
        {
            "AbsEntry": 5962,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K28-1"
        },
        {
            "AbsEntry": 5963,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K28-2"
        },
        {
            "AbsEntry": 5964,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K28-3"
        },
        {
            "AbsEntry": 5966,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K29-1"
        },
        {
            "AbsEntry": 5967,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K29-2"
        },
        {
            "AbsEntry": 5968,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K29-3"
        },
        {
            "AbsEntry": 5970,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K30-1"
        },
        {
            "AbsEntry": 5971,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K30-2"
        },
        {
            "AbsEntry": 5972,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K30-3"
        },
        {
            "AbsEntry": 5974,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K31-1"
        },
        {
            "AbsEntry": 5975,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K31-2"
        },
        {
            "AbsEntry": 5976,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K31-3"
        },
        {
            "AbsEntry": 5978,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K32-1"
        },
        {
            "AbsEntry": 5979,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K32-2"
        },
        {
            "AbsEntry": 5980,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K32-3"
        },
        {
            "AbsEntry": 5982,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K33-1"
        },
        {
            "AbsEntry": 5983,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K33-2"
        },
        {
            "AbsEntry": 5984,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K33-3"
        },
        {
            "AbsEntry": 5986,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K34-1"
        },
        {
            "AbsEntry": 5987,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K34-2"
        },
        {
            "AbsEntry": 5988,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K34-3"
        },
        {
            "AbsEntry": 5990,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K35-1"
        },
        {
            "AbsEntry": 5991,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K35-2"
        },
        {
            "AbsEntry": 5992,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K35-3"
        },
        {
            "AbsEntry": 5994,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K36-1"
        },
        {
            "AbsEntry": 5995,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K36-2"
        },
        {
            "AbsEntry": 5996,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3K36-3"
        },
        {
            "AbsEntry": 6130,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L01-1"
        },
        {
            "AbsEntry": 6131,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L01-2"
        },
        {
            "AbsEntry": 6132,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L01-3"
        },
        {
            "AbsEntry": 6133,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L02-1"
        },
        {
            "AbsEntry": 6134,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L02-2"
        },
        {
            "AbsEntry": 6135,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L02-3"
        },
        {
            "AbsEntry": 6136,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L03-1"
        },
        {
            "AbsEntry": 6137,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L03-2"
        },
        {
            "AbsEntry": 6138,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L03-3"
        },
        {
            "AbsEntry": 6139,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L04-1"
        },
        {
            "AbsEntry": 6140,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L04-2"
        },
        {
            "AbsEntry": 6141,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L04-3"
        },
        {
            "AbsEntry": 6142,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L05-1"
        },
        {
            "AbsEntry": 6143,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L05-2"
        },
        {
            "AbsEntry": 6144,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L05-3"
        },
        {
            "AbsEntry": 6145,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L06-1"
        },
        {
            "AbsEntry": 6146,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L06-2"
        },
        {
            "AbsEntry": 6147,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L06-3"
        },
        {
            "AbsEntry": 6148,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L07-1"
        },
        {
            "AbsEntry": 6149,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L07-2"
        },
        {
            "AbsEntry": 6150,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L07-3"
        },
        {
            "AbsEntry": 6151,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L08-1"
        },
        {
            "AbsEntry": 6152,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L08-2"
        },
        {
            "AbsEntry": 6153,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L08-3"
        },
        {
            "AbsEntry": 6154,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L09-1"
        },
        {
            "AbsEntry": 6155,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L09-2"
        },
        {
            "AbsEntry": 6156,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L09-3"
        },
        {
            "AbsEntry": 6157,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L10-1"
        },
        {
            "AbsEntry": 6158,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L10-2"
        },
        {
            "AbsEntry": 6159,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L10-3"
        },
        {
            "AbsEntry": 6160,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L11-1"
        },
        {
            "AbsEntry": 6161,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L11-2"
        },
        {
            "AbsEntry": 6162,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L11-3"
        },
        {
            "AbsEntry": 6163,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L12-1"
        },
        {
            "AbsEntry": 6164,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L12-2"
        },
        {
            "AbsEntry": 6165,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L12-3"
        },
        {
            "AbsEntry": 6166,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L13-1"
        },
        {
            "AbsEntry": 6167,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L13-2"
        },
        {
            "AbsEntry": 6168,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L13-3"
        },
        {
            "AbsEntry": 6169,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L14-1"
        },
        {
            "AbsEntry": 6170,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L14-2"
        },
        {
            "AbsEntry": 6171,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L14-3"
        },
        {
            "AbsEntry": 6172,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L15-1"
        },
        {
            "AbsEntry": 6173,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L15-2"
        },
        {
            "AbsEntry": 6174,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L15-3"
        },
        {
            "AbsEntry": 6175,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L16-1"
        },
        {
            "AbsEntry": 6176,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L16-2"
        },
        {
            "AbsEntry": 6177,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L16-3"
        },
        {
            "AbsEntry": 6178,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L17-1"
        },
        {
            "AbsEntry": 6179,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L17-2"
        },
        {
            "AbsEntry": 6180,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L17-3"
        },
        {
            "AbsEntry": 6181,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L18-1"
        },
        {
            "AbsEntry": 6182,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L18-2"
        },
        {
            "AbsEntry": 6183,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L18-3"
        },
        {
            "AbsEntry": 6184,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L19-1"
        },
        {
            "AbsEntry": 6185,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L19-2"
        },
        {
            "AbsEntry": 6186,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L19-3"
        },
        {
            "AbsEntry": 6187,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L20-1"
        },
        {
            "AbsEntry": 6188,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L20-2"
        },
        {
            "AbsEntry": 6189,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L20-3"
        },
        {
            "AbsEntry": 6190,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L21-1"
        },
        {
            "AbsEntry": 6191,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L21-2"
        },
        {
            "AbsEntry": 6192,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L21-3"
        },
        {
            "AbsEntry": 6193,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L22-1"
        },
        {
            "AbsEntry": 6194,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L22-2"
        },
        {
            "AbsEntry": 6195,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L22-3"
        },
        {
            "AbsEntry": 6196,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L23-1"
        },
        {
            "AbsEntry": 6197,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L23-2"
        },
        {
            "AbsEntry": 6198,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L23-3"
        },
        {
            "AbsEntry": 6199,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L24-1"
        },
        {
            "AbsEntry": 6200,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L24-2"
        },
        {
            "AbsEntry": 6201,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L24-3"
        },
        {
            "AbsEntry": 6202,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L25-1"
        },
        {
            "AbsEntry": 6203,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L25-2"
        },
        {
            "AbsEntry": 6204,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L25-3"
        },
        {
            "AbsEntry": 6205,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L26-1"
        },
        {
            "AbsEntry": 6206,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L26-2"
        },
        {
            "AbsEntry": 6207,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L26-3"
        },
        {
            "AbsEntry": 6208,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L27-1"
        },
        {
            "AbsEntry": 6209,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L27-2"
        },
        {
            "AbsEntry": 6210,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L27-3"
        },
        {
            "AbsEntry": 6211,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L28-1"
        },
        {
            "AbsEntry": 6212,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L28-2"
        },
        {
            "AbsEntry": 6213,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L28-3"
        },
        {
            "AbsEntry": 6214,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L29-1"
        },
        {
            "AbsEntry": 6215,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L29-2"
        },
        {
            "AbsEntry": 6216,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L29-3"
        },
        {
            "AbsEntry": 6217,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L30-1"
        },
        {
            "AbsEntry": 6218,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L30-2"
        },
        {
            "AbsEntry": 6219,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L30-3"
        },
        {
            "AbsEntry": 6220,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L31-1"
        },
        {
            "AbsEntry": 6221,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L31-2"
        },
        {
            "AbsEntry": 6222,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L31-3"
        },
        {
            "AbsEntry": 6223,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L32-1"
        },
        {
            "AbsEntry": 6224,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L32-2"
        },
        {
            "AbsEntry": 6225,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L32-3"
        },
        {
            "AbsEntry": 6226,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L33-1"
        },
        {
            "AbsEntry": 6227,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L33-2"
        },
        {
            "AbsEntry": 6228,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L33-3"
        },
        {
            "AbsEntry": 6229,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L34-1"
        },
        {
            "AbsEntry": 6230,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L34-2"
        },
        {
            "AbsEntry": 6231,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L34-3"
        },
        {
            "AbsEntry": 6232,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L35-1"
        },
        {
            "AbsEntry": 6233,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L35-2"
        },
        {
            "AbsEntry": 6234,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L35-3"
        },
        {
            "AbsEntry": 6235,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L36-1"
        },
        {
            "AbsEntry": 6236,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L36-2"
        },
        {
            "AbsEntry": 6237,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L36-3"
        },
        {
            "AbsEntry": 6238,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L37-1"
        },
        {
            "AbsEntry": 6239,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L37-2"
        },
        {
            "AbsEntry": 6240,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L37-3"
        },
        {
            "AbsEntry": 6241,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L38-1"
        },
        {
            "AbsEntry": 6242,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L38-2"
        },
        {
            "AbsEntry": 6243,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L38-3"
        },
        {
            "AbsEntry": 6244,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L39-1"
        },
        {
            "AbsEntry": 6245,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L39-2"
        },
        {
            "AbsEntry": 6246,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L39-3"
        },
        {
            "AbsEntry": 6247,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L40-1"
        },
        {
            "AbsEntry": 6248,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L40-2"
        },
        {
            "AbsEntry": 6249,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L40-3"
        },
        {
            "AbsEntry": 6250,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L41-1"
        },
        {
            "AbsEntry": 6251,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L41-2"
        },
        {
            "AbsEntry": 6252,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L41-3"
        },
        {
            "AbsEntry": 6253,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L42-1"
        },
        {
            "AbsEntry": 6254,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L42-2"
        },
        {
            "AbsEntry": 6255,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L42-3"
        },
        {
            "AbsEntry": 6256,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L43-1"
        },
        {
            "AbsEntry": 6257,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L43-2"
        },
        {
            "AbsEntry": 6258,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L43-3"
        },
        {
            "AbsEntry": 6259,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L44-1"
        },
        {
            "AbsEntry": 6260,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L44-2"
        },
        {
            "AbsEntry": 6261,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-3L44-3"
        },
        {
            "AbsEntry": 7291,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A01-1"
        },
        {
            "AbsEntry": 7292,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A01-2"
        },
        {
            "AbsEntry": 7293,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A01-3"
        },
        {
            "AbsEntry": 7294,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A02-1"
        },
        {
            "AbsEntry": 7295,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A02-2"
        },
        {
            "AbsEntry": 7296,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A02-3"
        },
        {
            "AbsEntry": 7297,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A03-1"
        },
        {
            "AbsEntry": 7298,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A03-2"
        },
        {
            "AbsEntry": 7299,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A03-3"
        },
        {
            "AbsEntry": 7300,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A04-1"
        },
        {
            "AbsEntry": 7301,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A04-2"
        },
        {
            "AbsEntry": 7302,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A04-3"
        },
        {
            "AbsEntry": 7303,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A05-1"
        },
        {
            "AbsEntry": 7304,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A05-2"
        },
        {
            "AbsEntry": 7305,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A05-3"
        },
        {
            "AbsEntry": 7306,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A06-1"
        },
        {
            "AbsEntry": 7307,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A06-2"
        },
        {
            "AbsEntry": 7308,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A06-3"
        },
        {
            "AbsEntry": 7309,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A07-1"
        },
        {
            "AbsEntry": 7310,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A07-2"
        },
        {
            "AbsEntry": 7311,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A07-3"
        },
        {
            "AbsEntry": 7312,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A08-1"
        },
        {
            "AbsEntry": 7313,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A08-2"
        },
        {
            "AbsEntry": 7314,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A08-3"
        },
        {
            "AbsEntry": 7315,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A09-1"
        },
        {
            "AbsEntry": 7316,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A09-2"
        },
        {
            "AbsEntry": 7317,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A09-3"
        },
        {
            "AbsEntry": 7318,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A10-1"
        },
        {
            "AbsEntry": 7319,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A10-2"
        },
        {
            "AbsEntry": 7320,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A10-3"
        },
        {
            "AbsEntry": 7321,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A11-1"
        },
        {
            "AbsEntry": 7322,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A11-2"
        },
        {
            "AbsEntry": 7323,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A11-3"
        },
        {
            "AbsEntry": 7324,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A12-1"
        },
        {
            "AbsEntry": 7325,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A12-2"
        },
        {
            "AbsEntry": 7326,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A12-3"
        },
        {
            "AbsEntry": 7327,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A13-1"
        },
        {
            "AbsEntry": 7328,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A13-2"
        },
        {
            "AbsEntry": 7329,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A13-3"
        },
        {
            "AbsEntry": 7330,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A14-1"
        },
        {
            "AbsEntry": 7331,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A14-2"
        },
        {
            "AbsEntry": 7332,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A14-3"
        },
        {
            "AbsEntry": 7333,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A15-1"
        },
        {
            "AbsEntry": 7334,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A15-2"
        },
        {
            "AbsEntry": 7335,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A15-3"
        },
        {
            "AbsEntry": 7336,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A16-1"
        },
        {
            "AbsEntry": 7337,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A16-2"
        },
        {
            "AbsEntry": 7338,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A16-3"
        },
        {
            "AbsEntry": 7339,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A17-1"
        },
        {
            "AbsEntry": 7340,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A17-2"
        },
        {
            "AbsEntry": 7341,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A17-3"
        },
        {
            "AbsEntry": 7342,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A18-1"
        },
        {
            "AbsEntry": 7343,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A18-2"
        },
        {
            "AbsEntry": 7344,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A18-3"
        },
        {
            "AbsEntry": 7345,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A19-1"
        },
        {
            "AbsEntry": 7346,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A19-2"
        },
        {
            "AbsEntry": 7347,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A19-3"
        },
        {
            "AbsEntry": 7348,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A20-1"
        },
        {
            "AbsEntry": 7349,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A20-2"
        },
        {
            "AbsEntry": 7350,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A20-3"
        },
        {
            "AbsEntry": 7351,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A21-1"
        },
        {
            "AbsEntry": 7352,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A21-2"
        },
        {
            "AbsEntry": 7353,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A21-3"
        },
        {
            "AbsEntry": 7354,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A22-1"
        },
        {
            "AbsEntry": 7355,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A22-2"
        },
        {
            "AbsEntry": 7356,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A22-3"
        },
        {
            "AbsEntry": 7357,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A23-1"
        },
        {
            "AbsEntry": 7358,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A23-2"
        },
        {
            "AbsEntry": 7359,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A23-3"
        },
        {
            "AbsEntry": 7360,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A24-1"
        },
        {
            "AbsEntry": 7361,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A24-2"
        },
        {
            "AbsEntry": 7362,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A24-3"
        },
        {
            "AbsEntry": 7363,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A25-1"
        },
        {
            "AbsEntry": 7364,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A25-2"
        },
        {
            "AbsEntry": 7365,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A25-3"
        },
        {
            "AbsEntry": 7366,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A26-1"
        },
        {
            "AbsEntry": 7367,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A26-2"
        },
        {
            "AbsEntry": 7368,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A26-3"
        },
        {
            "AbsEntry": 7369,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A27-1"
        },
        {
            "AbsEntry": 7370,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A27-2"
        },
        {
            "AbsEntry": 7371,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A27-3"
        },
        {
            "AbsEntry": 7372,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A28-1"
        },
        {
            "AbsEntry": 7373,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A28-2"
        },
        {
            "AbsEntry": 7374,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A28-3"
        },
        {
            "AbsEntry": 7375,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A29-1"
        },
        {
            "AbsEntry": 7376,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A29-2"
        },
        {
            "AbsEntry": 7377,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A29-3"
        },
        {
            "AbsEntry": 7378,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A30-1"
        },
        {
            "AbsEntry": 7379,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A30-2"
        },
        {
            "AbsEntry": 7380,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A30-3"
        },
        {
            "AbsEntry": 7381,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A31-1"
        },
        {
            "AbsEntry": 7382,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A31-2"
        },
        {
            "AbsEntry": 7383,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A31-3"
        },
        {
            "AbsEntry": 7384,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A32-1"
        },
        {
            "AbsEntry": 7385,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A32-2"
        },
        {
            "AbsEntry": 7386,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A32-3"
        },
        {
            "AbsEntry": 7387,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A33-1"
        },
        {
            "AbsEntry": 7388,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A33-2"
        },
        {
            "AbsEntry": 7389,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A33-3"
        },
        {
            "AbsEntry": 7390,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A34-1"
        },
        {
            "AbsEntry": 7391,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A34-2"
        },
        {
            "AbsEntry": 7392,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A34-3"
        },
        {
            "AbsEntry": 7393,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A35-1"
        },
        {
            "AbsEntry": 7394,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A35-2"
        },
        {
            "AbsEntry": 7395,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A35-3"
        },
        {
            "AbsEntry": 7396,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A36-1"
        },
        {
            "AbsEntry": 7397,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A36-2"
        },
        {
            "AbsEntry": 7398,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A36-3"
        },
        {
            "AbsEntry": 7399,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A37-1"
        },
        {
            "AbsEntry": 7400,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A37-2"
        },
        {
            "AbsEntry": 7401,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A37-3"
        },
        {
            "AbsEntry": 7402,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A38-1"
        },
        {
            "AbsEntry": 7403,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A38-2"
        },
        {
            "AbsEntry": 7404,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A38-3"
        },
        {
            "AbsEntry": 7405,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A39-1"
        },
        {
            "AbsEntry": 7406,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A39-2"
        },
        {
            "AbsEntry": 7407,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A39-3"
        },
        {
            "AbsEntry": 7408,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A40-1"
        },
        {
            "AbsEntry": 7409,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A40-2"
        },
        {
            "AbsEntry": 7410,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A40-3"
        },
        {
            "AbsEntry": 7411,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A41-1"
        },
        {
            "AbsEntry": 7412,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A41-2"
        },
        {
            "AbsEntry": 7413,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A41-3"
        },
        {
            "AbsEntry": 7414,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A42-1"
        },
        {
            "AbsEntry": 7415,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A42-2"
        },
        {
            "AbsEntry": 7416,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A42-3"
        },
        {
            "AbsEntry": 7417,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A43-1"
        },
        {
            "AbsEntry": 7418,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A43-2"
        },
        {
            "AbsEntry": 7419,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A43-3"
        },
        {
            "AbsEntry": 7420,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A44-1"
        },
        {
            "AbsEntry": 7421,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A44-2"
        },
        {
            "AbsEntry": 7422,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A44-3"
        },
        {
            "AbsEntry": 7423,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A45-1"
        },
        {
            "AbsEntry": 7424,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A45-2"
        },
        {
            "AbsEntry": 7425,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A45-3"
        },
        {
            "AbsEntry": 7426,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A46-1"
        },
        {
            "AbsEntry": 7427,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A46-2"
        },
        {
            "AbsEntry": 7428,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A46-3"
        },
        {
            "AbsEntry": 7429,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A47-1"
        },
        {
            "AbsEntry": 7430,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A47-2"
        },
        {
            "AbsEntry": 7431,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A47-3"
        },
        {
            "AbsEntry": 7432,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A48-1"
        },
        {
            "AbsEntry": 7433,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A48-2"
        },
        {
            "AbsEntry": 7434,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A48-3"
        },
        {
            "AbsEntry": 7435,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A49-1"
        },
        {
            "AbsEntry": 7436,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A49-2"
        },
        {
            "AbsEntry": 7437,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A49-3"
        },
        {
            "AbsEntry": 7438,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A50-1"
        },
        {
            "AbsEntry": 7439,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A50-2"
        },
        {
            "AbsEntry": 7440,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A50-3"
        },
        {
            "AbsEntry": 8650,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A51-1"
        },
        {
            "AbsEntry": 8651,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A51-2"
        },
        {
            "AbsEntry": 8652,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A51-3"
        },
        {
            "AbsEntry": 8653,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A52-1"
        },
        {
            "AbsEntry": 8654,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A52-2"
        },
        {
            "AbsEntry": 8655,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8A52-3"
        },
        {
            "AbsEntry": 7441,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B01-1"
        },
        {
            "AbsEntry": 7442,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B01-2"
        },
        {
            "AbsEntry": 7443,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B01-3"
        },
        {
            "AbsEntry": 7444,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B02-1"
        },
        {
            "AbsEntry": 7445,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B02-2"
        },
        {
            "AbsEntry": 7446,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B02-3"
        },
        {
            "AbsEntry": 7447,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B03-1"
        },
        {
            "AbsEntry": 7448,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B03-2"
        },
        {
            "AbsEntry": 7449,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B03-3"
        },
        {
            "AbsEntry": 7450,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B04-1"
        },
        {
            "AbsEntry": 7451,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B04-2"
        },
        {
            "AbsEntry": 7452,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B04-3"
        },
        {
            "AbsEntry": 7453,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B05-1"
        },
        {
            "AbsEntry": 7454,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B05-2"
        },
        {
            "AbsEntry": 7455,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B05-3"
        },
        {
            "AbsEntry": 7456,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B06-1"
        },
        {
            "AbsEntry": 7457,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B06-2"
        },
        {
            "AbsEntry": 7458,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B06-3"
        },
        {
            "AbsEntry": 7459,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B07-1"
        },
        {
            "AbsEntry": 7460,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B07-2"
        },
        {
            "AbsEntry": 7461,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B07-3"
        },
        {
            "AbsEntry": 7462,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B08-1"
        },
        {
            "AbsEntry": 7463,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B08-2"
        },
        {
            "AbsEntry": 7464,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B08-3"
        },
        {
            "AbsEntry": 7465,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B09-1"
        },
        {
            "AbsEntry": 7466,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B09-2"
        },
        {
            "AbsEntry": 7467,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B09-3"
        },
        {
            "AbsEntry": 7468,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B10-1"
        },
        {
            "AbsEntry": 7469,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B10-2"
        },
        {
            "AbsEntry": 7470,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B10-3"
        },
        {
            "AbsEntry": 7471,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B11-1"
        },
        {
            "AbsEntry": 7472,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B11-2"
        },
        {
            "AbsEntry": 7473,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B11-3"
        },
        {
            "AbsEntry": 7474,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B12-1"
        },
        {
            "AbsEntry": 7475,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B12-2"
        },
        {
            "AbsEntry": 7476,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B12-3"
        },
        {
            "AbsEntry": 7477,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B13-1"
        },
        {
            "AbsEntry": 7478,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B13-2"
        },
        {
            "AbsEntry": 7479,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B13-3"
        },
        {
            "AbsEntry": 7480,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B14-1"
        },
        {
            "AbsEntry": 7481,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B14-2"
        },
        {
            "AbsEntry": 7482,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B14-3"
        },
        {
            "AbsEntry": 7483,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B15-1"
        },
        {
            "AbsEntry": 7484,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B15-2"
        },
        {
            "AbsEntry": 7485,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B15-3"
        },
        {
            "AbsEntry": 7486,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B16-1"
        },
        {
            "AbsEntry": 7487,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B16-2"
        },
        {
            "AbsEntry": 7488,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B16-3"
        },
        {
            "AbsEntry": 7489,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B17-1"
        },
        {
            "AbsEntry": 7490,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B17-2"
        },
        {
            "AbsEntry": 7491,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B17-3"
        },
        {
            "AbsEntry": 7492,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B18-1"
        },
        {
            "AbsEntry": 7493,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B18-2"
        },
        {
            "AbsEntry": 7494,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B18-3"
        },
        {
            "AbsEntry": 7495,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B19-1"
        },
        {
            "AbsEntry": 7496,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B19-2"
        },
        {
            "AbsEntry": 7497,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B19-3"
        },
        {
            "AbsEntry": 7498,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B20-1"
        },
        {
            "AbsEntry": 7499,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B20-2"
        },
        {
            "AbsEntry": 7500,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B20-3"
        },
        {
            "AbsEntry": 7501,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B21-1"
        },
        {
            "AbsEntry": 7502,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B21-2"
        },
        {
            "AbsEntry": 7503,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B21-3"
        },
        {
            "AbsEntry": 7504,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B22-1"
        },
        {
            "AbsEntry": 7505,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B22-2"
        },
        {
            "AbsEntry": 7506,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B22-3"
        },
        {
            "AbsEntry": 7507,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B23-1"
        },
        {
            "AbsEntry": 7508,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B23-2"
        },
        {
            "AbsEntry": 7509,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B23-3"
        },
        {
            "AbsEntry": 7510,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B24-1"
        },
        {
            "AbsEntry": 7511,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B24-2"
        },
        {
            "AbsEntry": 7512,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B24-3"
        },
        {
            "AbsEntry": 7513,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B25-1"
        },
        {
            "AbsEntry": 7514,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B25-2"
        },
        {
            "AbsEntry": 7515,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B25-3"
        },
        {
            "AbsEntry": 7516,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B26-1"
        },
        {
            "AbsEntry": 7517,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B26-2"
        },
        {
            "AbsEntry": 7518,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B26-3"
        },
        {
            "AbsEntry": 7519,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B27-1"
        },
        {
            "AbsEntry": 7520,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B27-2"
        },
        {
            "AbsEntry": 7521,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B27-3"
        },
        {
            "AbsEntry": 7522,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B28-1"
        },
        {
            "AbsEntry": 7523,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B28-2"
        },
        {
            "AbsEntry": 7524,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B28-3"
        },
        {
            "AbsEntry": 7525,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B29-1"
        },
        {
            "AbsEntry": 7526,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B29-2"
        },
        {
            "AbsEntry": 7527,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B29-3"
        },
        {
            "AbsEntry": 7528,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B30-1"
        },
        {
            "AbsEntry": 7529,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B30-2"
        },
        {
            "AbsEntry": 7530,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B30-3"
        },
        {
            "AbsEntry": 7531,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B31-1"
        },
        {
            "AbsEntry": 7532,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B31-2"
        },
        {
            "AbsEntry": 7533,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B31-3"
        },
        {
            "AbsEntry": 7534,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B32-1"
        },
        {
            "AbsEntry": 7535,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B32-2"
        },
        {
            "AbsEntry": 7536,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B32-3"
        },
        {
            "AbsEntry": 7537,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B33-1"
        },
        {
            "AbsEntry": 7538,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B33-2"
        },
        {
            "AbsEntry": 7539,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B33-3"
        },
        {
            "AbsEntry": 7540,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B34-1"
        },
        {
            "AbsEntry": 7541,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B34-2"
        },
        {
            "AbsEntry": 7542,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B34-3"
        },
        {
            "AbsEntry": 7543,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B35-1"
        },
        {
            "AbsEntry": 7544,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B35-2"
        },
        {
            "AbsEntry": 7545,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B35-3"
        },
        {
            "AbsEntry": 7546,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B36-1"
        },
        {
            "AbsEntry": 7547,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B36-2"
        },
        {
            "AbsEntry": 7548,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B36-3"
        },
        {
            "AbsEntry": 7549,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B37-1"
        },
        {
            "AbsEntry": 7550,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B37-2"
        },
        {
            "AbsEntry": 7551,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B37-3"
        },
        {
            "AbsEntry": 7552,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B38-1"
        },
        {
            "AbsEntry": 7553,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B38-2"
        },
        {
            "AbsEntry": 7554,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B38-3"
        },
        {
            "AbsEntry": 7555,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B39-1"
        },
        {
            "AbsEntry": 7556,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B39-2"
        },
        {
            "AbsEntry": 7557,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B39-3"
        },
        {
            "AbsEntry": 7558,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B40-1"
        },
        {
            "AbsEntry": 7559,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B40-2"
        },
        {
            "AbsEntry": 7560,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B40-3"
        },
        {
            "AbsEntry": 7561,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B41-1"
        },
        {
            "AbsEntry": 7562,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B41-2"
        },
        {
            "AbsEntry": 7563,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B41-3"
        },
        {
            "AbsEntry": 7564,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B42-1"
        },
        {
            "AbsEntry": 7565,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B42-2"
        },
        {
            "AbsEntry": 7566,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B42-3"
        },
        {
            "AbsEntry": 7567,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B43-1"
        },
        {
            "AbsEntry": 7568,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B43-2"
        },
        {
            "AbsEntry": 7569,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B43-3"
        },
        {
            "AbsEntry": 7570,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B44-1"
        },
        {
            "AbsEntry": 7571,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B44-2"
        },
        {
            "AbsEntry": 7572,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B44-3"
        },
        {
            "AbsEntry": 7573,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B45-1"
        },
        {
            "AbsEntry": 7574,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B45-2"
        },
        {
            "AbsEntry": 7575,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B45-3"
        },
        {
            "AbsEntry": 7576,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B46-1"
        },
        {
            "AbsEntry": 7577,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B46-2"
        },
        {
            "AbsEntry": 7578,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B46-3"
        },
        {
            "AbsEntry": 7579,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B47-1"
        },
        {
            "AbsEntry": 7580,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B47-2"
        },
        {
            "AbsEntry": 7581,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B47-3"
        },
        {
            "AbsEntry": 7582,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B48-1"
        },
        {
            "AbsEntry": 7583,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B48-2"
        },
        {
            "AbsEntry": 7584,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B48-3"
        },
        {
            "AbsEntry": 7585,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B49-1"
        },
        {
            "AbsEntry": 7586,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B49-2"
        },
        {
            "AbsEntry": 7587,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B49-3"
        },
        {
            "AbsEntry": 7588,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B50-1"
        },
        {
            "AbsEntry": 7589,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B50-2"
        },
        {
            "AbsEntry": 7590,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B50-3"
        },
        {
            "AbsEntry": 8659,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B51-1"
        },
        {
            "AbsEntry": 8660,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B51-2"
        },
        {
            "AbsEntry": 8661,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B51-3"
        },
        {
            "AbsEntry": 8656,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B52-1"
        },
        {
            "AbsEntry": 8657,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B52-2"
        },
        {
            "AbsEntry": 8658,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8B52-3"
        },
        {
            "AbsEntry": 7591,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C01-1"
        },
        {
            "AbsEntry": 7592,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C01-2"
        },
        {
            "AbsEntry": 7593,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C01-3"
        },
        {
            "AbsEntry": 7594,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C02-1"
        },
        {
            "AbsEntry": 7595,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C02-2"
        },
        {
            "AbsEntry": 7596,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C02-3"
        },
        {
            "AbsEntry": 7597,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C03-1"
        },
        {
            "AbsEntry": 7598,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C03-2"
        },
        {
            "AbsEntry": 7599,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C03-3"
        },
        {
            "AbsEntry": 7600,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C04-1"
        },
        {
            "AbsEntry": 7601,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C04-2"
        },
        {
            "AbsEntry": 7602,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C04-3"
        },
        {
            "AbsEntry": 7603,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C05-1"
        },
        {
            "AbsEntry": 7604,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C05-2"
        },
        {
            "AbsEntry": 7605,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C05-3"
        },
        {
            "AbsEntry": 7606,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C06-1"
        },
        {
            "AbsEntry": 7607,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C06-2"
        },
        {
            "AbsEntry": 7608,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C06-3"
        },
        {
            "AbsEntry": 7609,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C07-1"
        },
        {
            "AbsEntry": 7610,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C07-2"
        },
        {
            "AbsEntry": 7611,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C07-3"
        },
        {
            "AbsEntry": 7612,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C08-1"
        },
        {
            "AbsEntry": 7613,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C08-2"
        },
        {
            "AbsEntry": 7614,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C08-3"
        },
        {
            "AbsEntry": 7615,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C09-1"
        },
        {
            "AbsEntry": 7616,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C09-2"
        },
        {
            "AbsEntry": 7617,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C09-3"
        },
        {
            "AbsEntry": 7618,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C10-1"
        },
        {
            "AbsEntry": 7619,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C10-2"
        },
        {
            "AbsEntry": 7620,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C10-3"
        },
        {
            "AbsEntry": 7621,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C11-1"
        },
        {
            "AbsEntry": 7622,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C11-2"
        },
        {
            "AbsEntry": 7623,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C11-3"
        },
        {
            "AbsEntry": 7624,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C12-1"
        },
        {
            "AbsEntry": 7625,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C12-2"
        },
        {
            "AbsEntry": 7626,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C12-3"
        },
        {
            "AbsEntry": 7627,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C13-1"
        },
        {
            "AbsEntry": 7628,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C13-2"
        },
        {
            "AbsEntry": 7629,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C13-3"
        },
        {
            "AbsEntry": 7630,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C14-1"
        },
        {
            "AbsEntry": 7631,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C14-2"
        },
        {
            "AbsEntry": 7632,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C14-3"
        },
        {
            "AbsEntry": 7633,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C15-1"
        },
        {
            "AbsEntry": 7634,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C15-2"
        },
        {
            "AbsEntry": 7635,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C15-3"
        },
        {
            "AbsEntry": 7636,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C16-1"
        },
        {
            "AbsEntry": 7637,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C16-2"
        },
        {
            "AbsEntry": 7638,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C16-3"
        },
        {
            "AbsEntry": 7639,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C17-1"
        },
        {
            "AbsEntry": 7640,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C17-2"
        },
        {
            "AbsEntry": 7641,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C17-3"
        },
        {
            "AbsEntry": 7642,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C18-1"
        },
        {
            "AbsEntry": 7643,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C18-2"
        },
        {
            "AbsEntry": 7644,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C18-3"
        },
        {
            "AbsEntry": 7645,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C19-1"
        },
        {
            "AbsEntry": 7646,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C19-2"
        },
        {
            "AbsEntry": 7647,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C19-3"
        },
        {
            "AbsEntry": 7648,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C20-1"
        },
        {
            "AbsEntry": 7649,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C20-2"
        },
        {
            "AbsEntry": 7650,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C20-3"
        },
        {
            "AbsEntry": 7651,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C21-1"
        },
        {
            "AbsEntry": 7652,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C21-2"
        },
        {
            "AbsEntry": 7653,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C21-3"
        },
        {
            "AbsEntry": 7654,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C22-1"
        },
        {
            "AbsEntry": 7655,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C22-2"
        },
        {
            "AbsEntry": 7656,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C22-3"
        },
        {
            "AbsEntry": 7657,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C23-1"
        },
        {
            "AbsEntry": 7658,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C23-2"
        },
        {
            "AbsEntry": 7659,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C23-3"
        },
        {
            "AbsEntry": 7660,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C24-1"
        },
        {
            "AbsEntry": 7661,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C24-2"
        },
        {
            "AbsEntry": 7662,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C24-3"
        },
        {
            "AbsEntry": 7663,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C25-1"
        },
        {
            "AbsEntry": 7664,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C25-2"
        },
        {
            "AbsEntry": 7665,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C25-3"
        },
        {
            "AbsEntry": 7666,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C26-1"
        },
        {
            "AbsEntry": 7667,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C26-2"
        },
        {
            "AbsEntry": 7668,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C26-3"
        },
        {
            "AbsEntry": 7669,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C27-1"
        },
        {
            "AbsEntry": 7670,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C27-2"
        },
        {
            "AbsEntry": 7671,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C27-3"
        },
        {
            "AbsEntry": 7672,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C28-1"
        },
        {
            "AbsEntry": 7673,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C28-2"
        },
        {
            "AbsEntry": 7674,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C28-3"
        },
        {
            "AbsEntry": 7675,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C29-1"
        },
        {
            "AbsEntry": 7676,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C29-2"
        },
        {
            "AbsEntry": 7677,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C29-3"
        },
        {
            "AbsEntry": 7678,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C30-1"
        },
        {
            "AbsEntry": 7679,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C30-2"
        },
        {
            "AbsEntry": 7680,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C30-3"
        },
        {
            "AbsEntry": 7681,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C31-1"
        },
        {
            "AbsEntry": 7682,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C31-2"
        },
        {
            "AbsEntry": 7683,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C31-3"
        },
        {
            "AbsEntry": 7684,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C32-1"
        },
        {
            "AbsEntry": 7685,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C32-2"
        },
        {
            "AbsEntry": 7686,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C32-3"
        },
        {
            "AbsEntry": 7687,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C33-1"
        },
        {
            "AbsEntry": 7688,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C33-2"
        },
        {
            "AbsEntry": 7689,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C33-3"
        },
        {
            "AbsEntry": 7690,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C34-1"
        },
        {
            "AbsEntry": 7691,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C34-2"
        },
        {
            "AbsEntry": 7692,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C34-3"
        },
        {
            "AbsEntry": 7693,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C35-1"
        },
        {
            "AbsEntry": 7694,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C35-2"
        },
        {
            "AbsEntry": 7695,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C35-3"
        },
        {
            "AbsEntry": 7696,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C36-1"
        },
        {
            "AbsEntry": 7697,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C36-2"
        },
        {
            "AbsEntry": 7698,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C36-3"
        },
        {
            "AbsEntry": 7699,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C37-1"
        },
        {
            "AbsEntry": 7700,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C37-2"
        },
        {
            "AbsEntry": 7701,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C37-3"
        },
        {
            "AbsEntry": 7702,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C38-1"
        },
        {
            "AbsEntry": 7703,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C38-2"
        },
        {
            "AbsEntry": 7704,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C38-3"
        },
        {
            "AbsEntry": 7705,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C39-1"
        },
        {
            "AbsEntry": 7706,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C39-2"
        },
        {
            "AbsEntry": 7707,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C39-3"
        },
        {
            "AbsEntry": 7708,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C40-1"
        },
        {
            "AbsEntry": 7709,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C40-2"
        },
        {
            "AbsEntry": 7710,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C40-3"
        },
        {
            "AbsEntry": 7711,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C41-1"
        },
        {
            "AbsEntry": 7712,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C41-2"
        },
        {
            "AbsEntry": 7713,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C41-3"
        },
        {
            "AbsEntry": 7714,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C42-1"
        },
        {
            "AbsEntry": 7715,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C42-2"
        },
        {
            "AbsEntry": 7716,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C42-3"
        },
        {
            "AbsEntry": 7717,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C43-1"
        },
        {
            "AbsEntry": 7718,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C43-2"
        },
        {
            "AbsEntry": 7719,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C43-3"
        },
        {
            "AbsEntry": 7720,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C44-1"
        },
        {
            "AbsEntry": 7721,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C44-2"
        },
        {
            "AbsEntry": 7722,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C44-3"
        },
        {
            "AbsEntry": 7723,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C45-1"
        },
        {
            "AbsEntry": 7724,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C45-2"
        },
        {
            "AbsEntry": 7725,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C45-3"
        },
        {
            "AbsEntry": 7726,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C46-1"
        },
        {
            "AbsEntry": 7727,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C46-2"
        },
        {
            "AbsEntry": 7728,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C46-3"
        },
        {
            "AbsEntry": 7729,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C47-1"
        },
        {
            "AbsEntry": 7730,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C47-2"
        },
        {
            "AbsEntry": 7731,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C47-3"
        },
        {
            "AbsEntry": 7732,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C48-1"
        },
        {
            "AbsEntry": 7733,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C48-2"
        },
        {
            "AbsEntry": 7734,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C48-3"
        },
        {
            "AbsEntry": 7735,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C49-1"
        },
        {
            "AbsEntry": 7736,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C49-2"
        },
        {
            "AbsEntry": 7737,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C49-3"
        },
        {
            "AbsEntry": 7738,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C50-1"
        },
        {
            "AbsEntry": 7739,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C50-2"
        },
        {
            "AbsEntry": 7740,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C50-3"
        },
        {
            "AbsEntry": 8662,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C51-1"
        },
        {
            "AbsEntry": 8663,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C51-2"
        },
        {
            "AbsEntry": 8664,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C51-3"
        },
        {
            "AbsEntry": 8665,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C52-1"
        },
        {
            "AbsEntry": 8666,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C52-2"
        },
        {
            "AbsEntry": 8667,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8C52-3"
        },
        {
            "AbsEntry": 7741,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D01-1"
        },
        {
            "AbsEntry": 7742,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D01-2"
        },
        {
            "AbsEntry": 7743,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D01-3"
        },
        {
            "AbsEntry": 7744,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D02-1"
        },
        {
            "AbsEntry": 7745,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D02-2"
        },
        {
            "AbsEntry": 7746,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D02-3"
        },
        {
            "AbsEntry": 7747,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D03-1"
        },
        {
            "AbsEntry": 7748,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D03-2"
        },
        {
            "AbsEntry": 7749,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D03-3"
        },
        {
            "AbsEntry": 7750,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D04-1"
        },
        {
            "AbsEntry": 7751,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D04-2"
        },
        {
            "AbsEntry": 7752,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D04-3"
        },
        {
            "AbsEntry": 7753,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D05-1"
        },
        {
            "AbsEntry": 7754,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D05-2"
        },
        {
            "AbsEntry": 7755,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D05-3"
        },
        {
            "AbsEntry": 7756,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D06-1"
        },
        {
            "AbsEntry": 7757,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D06-2"
        },
        {
            "AbsEntry": 7758,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D06-3"
        },
        {
            "AbsEntry": 7759,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D07-1"
        },
        {
            "AbsEntry": 7760,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D07-2"
        },
        {
            "AbsEntry": 7761,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D07-3"
        },
        {
            "AbsEntry": 7762,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D08-1"
        },
        {
            "AbsEntry": 7763,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D08-2"
        },
        {
            "AbsEntry": 7764,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D08-3"
        },
        {
            "AbsEntry": 7765,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D09-1"
        },
        {
            "AbsEntry": 7766,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D09-2"
        },
        {
            "AbsEntry": 7767,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D09-3"
        },
        {
            "AbsEntry": 7768,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D10-1"
        },
        {
            "AbsEntry": 7769,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D10-2"
        },
        {
            "AbsEntry": 7770,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D10-3"
        },
        {
            "AbsEntry": 7771,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D11-1"
        },
        {
            "AbsEntry": 7772,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D11-2"
        },
        {
            "AbsEntry": 7773,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D11-3"
        },
        {
            "AbsEntry": 7774,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D12-1"
        },
        {
            "AbsEntry": 7775,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D12-2"
        },
        {
            "AbsEntry": 7776,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D12-3"
        },
        {
            "AbsEntry": 7777,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D13-1"
        },
        {
            "AbsEntry": 7778,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D13-2"
        },
        {
            "AbsEntry": 7779,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D13-3"
        },
        {
            "AbsEntry": 7780,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D14-1"
        },
        {
            "AbsEntry": 7781,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D14-2"
        },
        {
            "AbsEntry": 7782,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D14-3"
        },
        {
            "AbsEntry": 7783,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D15-1"
        },
        {
            "AbsEntry": 7784,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D15-2"
        },
        {
            "AbsEntry": 7785,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D15-3"
        },
        {
            "AbsEntry": 7786,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D16-1"
        },
        {
            "AbsEntry": 7787,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D16-2"
        },
        {
            "AbsEntry": 7788,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D16-3"
        },
        {
            "AbsEntry": 7789,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D17-1"
        },
        {
            "AbsEntry": 7790,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D17-2"
        },
        {
            "AbsEntry": 7791,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D17-3"
        },
        {
            "AbsEntry": 7792,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D18-1"
        },
        {
            "AbsEntry": 7793,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D18-2"
        },
        {
            "AbsEntry": 7794,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D18-3"
        },
        {
            "AbsEntry": 7795,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D19-1"
        },
        {
            "AbsEntry": 7796,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D19-2"
        },
        {
            "AbsEntry": 7797,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D19-3"
        },
        {
            "AbsEntry": 7798,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D20-1"
        },
        {
            "AbsEntry": 7799,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D20-2"
        },
        {
            "AbsEntry": 7800,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D20-3"
        },
        {
            "AbsEntry": 7801,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D21-1"
        },
        {
            "AbsEntry": 7802,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D21-2"
        },
        {
            "AbsEntry": 7803,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D21-3"
        },
        {
            "AbsEntry": 7804,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D22-1"
        },
        {
            "AbsEntry": 7805,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D22-2"
        },
        {
            "AbsEntry": 7806,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D22-3"
        },
        {
            "AbsEntry": 7807,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D23-1"
        },
        {
            "AbsEntry": 7808,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D23-2"
        },
        {
            "AbsEntry": 7809,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D23-3"
        },
        {
            "AbsEntry": 7810,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D24-1"
        },
        {
            "AbsEntry": 7811,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D24-2"
        },
        {
            "AbsEntry": 7812,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D24-3"
        },
        {
            "AbsEntry": 7813,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D25-1"
        },
        {
            "AbsEntry": 7814,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D25-2"
        },
        {
            "AbsEntry": 7815,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D25-3"
        },
        {
            "AbsEntry": 7816,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D26-1"
        },
        {
            "AbsEntry": 7817,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D26-2"
        },
        {
            "AbsEntry": 7818,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D26-3"
        },
        {
            "AbsEntry": 7819,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D27-1"
        },
        {
            "AbsEntry": 7820,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D27-2"
        },
        {
            "AbsEntry": 7821,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D27-3"
        },
        {
            "AbsEntry": 7822,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D28-1"
        },
        {
            "AbsEntry": 7823,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D28-2"
        },
        {
            "AbsEntry": 7824,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D28-3"
        },
        {
            "AbsEntry": 7825,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D29-1"
        },
        {
            "AbsEntry": 7826,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D29-2"
        },
        {
            "AbsEntry": 7827,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D29-3"
        },
        {
            "AbsEntry": 7828,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D30-1"
        },
        {
            "AbsEntry": 7829,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D30-2"
        },
        {
            "AbsEntry": 7830,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D30-3"
        },
        {
            "AbsEntry": 7831,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D31-1"
        },
        {
            "AbsEntry": 7832,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D31-2"
        },
        {
            "AbsEntry": 7833,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D31-3"
        },
        {
            "AbsEntry": 7834,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D32-1"
        },
        {
            "AbsEntry": 7835,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D32-2"
        },
        {
            "AbsEntry": 7836,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D32-3"
        },
        {
            "AbsEntry": 7837,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D33-1"
        },
        {
            "AbsEntry": 7838,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D33-2"
        },
        {
            "AbsEntry": 7839,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D33-3"
        },
        {
            "AbsEntry": 7840,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D34-1"
        },
        {
            "AbsEntry": 7841,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D34-2"
        },
        {
            "AbsEntry": 7842,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D34-3"
        },
        {
            "AbsEntry": 7843,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D35-1"
        },
        {
            "AbsEntry": 7844,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D35-2"
        },
        {
            "AbsEntry": 7845,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D35-3"
        },
        {
            "AbsEntry": 7846,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D36-1"
        },
        {
            "AbsEntry": 7847,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D36-2"
        },
        {
            "AbsEntry": 7848,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D36-3"
        },
        {
            "AbsEntry": 7849,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D37-1"
        },
        {
            "AbsEntry": 7850,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D37-2"
        },
        {
            "AbsEntry": 7851,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D37-3"
        },
        {
            "AbsEntry": 7852,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D38-1"
        },
        {
            "AbsEntry": 7853,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D38-2"
        },
        {
            "AbsEntry": 7854,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D38-3"
        },
        {
            "AbsEntry": 7855,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D39-1"
        },
        {
            "AbsEntry": 7856,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D39-2"
        },
        {
            "AbsEntry": 7857,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D39-3"
        },
        {
            "AbsEntry": 7858,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D40-1"
        },
        {
            "AbsEntry": 7859,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D40-2"
        },
        {
            "AbsEntry": 7860,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D40-3"
        },
        {
            "AbsEntry": 7861,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D41-1"
        },
        {
            "AbsEntry": 7862,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D41-2"
        },
        {
            "AbsEntry": 7863,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D41-3"
        },
        {
            "AbsEntry": 7864,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D42-1"
        },
        {
            "AbsEntry": 7865,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D42-2"
        },
        {
            "AbsEntry": 7866,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D42-3"
        },
        {
            "AbsEntry": 7867,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D43-1"
        },
        {
            "AbsEntry": 7868,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D43-2"
        },
        {
            "AbsEntry": 7869,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D43-3"
        },
        {
            "AbsEntry": 7870,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D44-1"
        },
        {
            "AbsEntry": 7871,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D44-2"
        },
        {
            "AbsEntry": 7872,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D44-3"
        },
        {
            "AbsEntry": 7873,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D45-1"
        },
        {
            "AbsEntry": 7874,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D45-2"
        },
        {
            "AbsEntry": 7875,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D45-3"
        },
        {
            "AbsEntry": 7876,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D46-1"
        },
        {
            "AbsEntry": 7877,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D46-2"
        },
        {
            "AbsEntry": 7878,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D46-3"
        },
        {
            "AbsEntry": 7879,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D47-1"
        },
        {
            "AbsEntry": 7880,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D47-2"
        },
        {
            "AbsEntry": 7881,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D47-3"
        },
        {
            "AbsEntry": 7882,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D48-1"
        },
        {
            "AbsEntry": 7883,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D48-2"
        },
        {
            "AbsEntry": 7884,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D48-3"
        },
        {
            "AbsEntry": 7885,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D49-1"
        },
        {
            "AbsEntry": 7886,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D49-2"
        },
        {
            "AbsEntry": 7887,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D49-3"
        },
        {
            "AbsEntry": 7888,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D50-1"
        },
        {
            "AbsEntry": 7889,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D50-2"
        },
        {
            "AbsEntry": 7890,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8D50-3"
        },
        {
            "AbsEntry": 7891,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E01-1"
        },
        {
            "AbsEntry": 7892,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E01-2"
        },
        {
            "AbsEntry": 7893,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E01-3"
        },
        {
            "AbsEntry": 7894,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E02-1"
        },
        {
            "AbsEntry": 7895,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E02-2"
        },
        {
            "AbsEntry": 7896,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E02-3"
        },
        {
            "AbsEntry": 7897,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E03-1"
        },
        {
            "AbsEntry": 7898,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E03-2"
        },
        {
            "AbsEntry": 7899,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E03-3"
        },
        {
            "AbsEntry": 7900,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E04-1"
        },
        {
            "AbsEntry": 7901,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E04-2"
        },
        {
            "AbsEntry": 7902,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E04-3"
        },
        {
            "AbsEntry": 7903,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E05-1"
        },
        {
            "AbsEntry": 7904,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E05-2"
        },
        {
            "AbsEntry": 7905,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E05-3"
        },
        {
            "AbsEntry": 7906,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E06-1"
        },
        {
            "AbsEntry": 7907,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E06-2"
        },
        {
            "AbsEntry": 7908,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E06-3"
        },
        {
            "AbsEntry": 7909,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E07-1"
        },
        {
            "AbsEntry": 7910,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E07-2"
        },
        {
            "AbsEntry": 7911,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E07-3"
        },
        {
            "AbsEntry": 7912,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E08-1"
        },
        {
            "AbsEntry": 7913,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E08-2"
        },
        {
            "AbsEntry": 7914,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E08-3"
        },
        {
            "AbsEntry": 7915,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E09-1"
        },
        {
            "AbsEntry": 7916,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E09-2"
        },
        {
            "AbsEntry": 7917,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E09-3"
        },
        {
            "AbsEntry": 7918,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E10-1"
        },
        {
            "AbsEntry": 7919,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E10-2"
        },
        {
            "AbsEntry": 7920,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E10-3"
        },
        {
            "AbsEntry": 7921,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E11-1"
        },
        {
            "AbsEntry": 7922,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E11-2"
        },
        {
            "AbsEntry": 7923,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E11-3"
        },
        {
            "AbsEntry": 7924,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E12-1"
        },
        {
            "AbsEntry": 7925,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E12-2"
        },
        {
            "AbsEntry": 7926,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E12-3"
        },
        {
            "AbsEntry": 7927,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E13-1"
        },
        {
            "AbsEntry": 7928,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E13-2"
        },
        {
            "AbsEntry": 7929,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E13-3"
        },
        {
            "AbsEntry": 7930,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E14-1"
        },
        {
            "AbsEntry": 7931,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E14-2"
        },
        {
            "AbsEntry": 7932,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E14-3"
        },
        {
            "AbsEntry": 7933,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E15-1"
        },
        {
            "AbsEntry": 7934,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E15-2"
        },
        {
            "AbsEntry": 7935,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E15-3"
        },
        {
            "AbsEntry": 7936,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E16-1"
        },
        {
            "AbsEntry": 7937,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E16-2"
        },
        {
            "AbsEntry": 7938,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E16-3"
        },
        {
            "AbsEntry": 7939,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E17-1"
        },
        {
            "AbsEntry": 7940,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E17-2"
        },
        {
            "AbsEntry": 7941,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E17-3"
        },
        {
            "AbsEntry": 7942,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E18-1"
        },
        {
            "AbsEntry": 7943,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E18-2"
        },
        {
            "AbsEntry": 7944,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E18-3"
        },
        {
            "AbsEntry": 7945,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E19-1"
        },
        {
            "AbsEntry": 7946,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E19-2"
        },
        {
            "AbsEntry": 7947,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E19-3"
        },
        {
            "AbsEntry": 7948,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E20-1"
        },
        {
            "AbsEntry": 7949,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E20-2"
        },
        {
            "AbsEntry": 7950,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E20-3"
        },
        {
            "AbsEntry": 7951,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E21-1"
        },
        {
            "AbsEntry": 7952,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E21-2"
        },
        {
            "AbsEntry": 7953,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E21-3"
        },
        {
            "AbsEntry": 7954,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E22-1"
        },
        {
            "AbsEntry": 7955,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E22-2"
        },
        {
            "AbsEntry": 7956,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E22-3"
        },
        {
            "AbsEntry": 7957,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E23-1"
        },
        {
            "AbsEntry": 7958,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E23-2"
        },
        {
            "AbsEntry": 7959,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E23-3"
        },
        {
            "AbsEntry": 7960,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E24-1"
        },
        {
            "AbsEntry": 7961,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E24-2"
        },
        {
            "AbsEntry": 7962,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E24-3"
        },
        {
            "AbsEntry": 7963,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E25-1"
        },
        {
            "AbsEntry": 7964,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E25-2"
        },
        {
            "AbsEntry": 7965,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E25-3"
        },
        {
            "AbsEntry": 7966,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E26-1"
        },
        {
            "AbsEntry": 7967,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E26-2"
        },
        {
            "AbsEntry": 7968,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E26-3"
        },
        {
            "AbsEntry": 7969,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E27-1"
        },
        {
            "AbsEntry": 7970,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E27-2"
        },
        {
            "AbsEntry": 7971,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E27-3"
        },
        {
            "AbsEntry": 7972,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E28-1"
        },
        {
            "AbsEntry": 7973,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E28-2"
        },
        {
            "AbsEntry": 7974,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8E28-3"
        },
        {
            "AbsEntry": 7975,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F01-1"
        },
        {
            "AbsEntry": 7976,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F01-2"
        },
        {
            "AbsEntry": 7977,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F01-3"
        },
        {
            "AbsEntry": 7978,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F02-1"
        },
        {
            "AbsEntry": 7979,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F02-2"
        },
        {
            "AbsEntry": 7980,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F02-3"
        },
        {
            "AbsEntry": 7981,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F03-1"
        },
        {
            "AbsEntry": 7982,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F03-2"
        },
        {
            "AbsEntry": 7983,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F03-3"
        },
        {
            "AbsEntry": 7984,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F04-1"
        },
        {
            "AbsEntry": 7985,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F04-2"
        },
        {
            "AbsEntry": 7986,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F04-3"
        },
        {
            "AbsEntry": 7987,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F05-1"
        },
        {
            "AbsEntry": 7988,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F05-2"
        },
        {
            "AbsEntry": 7989,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F05-3"
        },
        {
            "AbsEntry": 7990,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F06-1"
        },
        {
            "AbsEntry": 7991,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F06-2"
        },
        {
            "AbsEntry": 7992,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F06-3"
        },
        {
            "AbsEntry": 7993,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F07-1"
        },
        {
            "AbsEntry": 7994,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F07-2"
        },
        {
            "AbsEntry": 7995,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F07-3"
        },
        {
            "AbsEntry": 7996,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F08-1"
        },
        {
            "AbsEntry": 7997,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F08-2"
        },
        {
            "AbsEntry": 7998,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F08-3"
        },
        {
            "AbsEntry": 7999,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F09-1"
        },
        {
            "AbsEntry": 8000,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F09-2"
        },
        {
            "AbsEntry": 8001,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F09-3"
        },
        {
            "AbsEntry": 8002,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F10-1"
        },
        {
            "AbsEntry": 8003,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F10-2"
        },
        {
            "AbsEntry": 8004,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F10-3"
        },
        {
            "AbsEntry": 8005,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F11-1"
        },
        {
            "AbsEntry": 8006,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F11-2"
        },
        {
            "AbsEntry": 8007,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F11-3"
        },
        {
            "AbsEntry": 8008,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F12-1"
        },
        {
            "AbsEntry": 8009,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F12-2"
        },
        {
            "AbsEntry": 8010,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F12-3"
        },
        {
            "AbsEntry": 8011,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F13-1"
        },
        {
            "AbsEntry": 8012,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F13-2"
        },
        {
            "AbsEntry": 8013,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F13-3"
        },
        {
            "AbsEntry": 8014,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F14-1"
        },
        {
            "AbsEntry": 8015,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F14-2"
        },
        {
            "AbsEntry": 8016,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F14-3"
        },
        {
            "AbsEntry": 8017,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F15-1"
        },
        {
            "AbsEntry": 8018,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F15-2"
        },
        {
            "AbsEntry": 8019,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F15-3"
        },
        {
            "AbsEntry": 8020,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F16-1"
        },
        {
            "AbsEntry": 8021,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F16-2"
        },
        {
            "AbsEntry": 8022,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F16-3"
        },
        {
            "AbsEntry": 8023,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F17-1"
        },
        {
            "AbsEntry": 8024,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F17-2"
        },
        {
            "AbsEntry": 8025,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F17-3"
        },
        {
            "AbsEntry": 8026,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F18-1"
        },
        {
            "AbsEntry": 8027,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F18-2"
        },
        {
            "AbsEntry": 8028,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F18-3"
        },
        {
            "AbsEntry": 8029,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F19-1"
        },
        {
            "AbsEntry": 8030,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F19-2"
        },
        {
            "AbsEntry": 8031,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F19-3"
        },
        {
            "AbsEntry": 8032,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F20-1"
        },
        {
            "AbsEntry": 8033,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F20-2"
        },
        {
            "AbsEntry": 8034,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F20-3"
        },
        {
            "AbsEntry": 8035,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F21-1"
        },
        {
            "AbsEntry": 8036,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F21-2"
        },
        {
            "AbsEntry": 8037,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F21-3"
        },
        {
            "AbsEntry": 8038,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F22-1"
        },
        {
            "AbsEntry": 8039,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F22-2"
        },
        {
            "AbsEntry": 8040,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F22-3"
        },
        {
            "AbsEntry": 8041,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F23-1"
        },
        {
            "AbsEntry": 8042,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F23-2"
        },
        {
            "AbsEntry": 8043,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F23-3"
        },
        {
            "AbsEntry": 8044,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F24-1"
        },
        {
            "AbsEntry": 8045,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F24-2"
        },
        {
            "AbsEntry": 8046,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F24-3"
        },
        {
            "AbsEntry": 8047,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F25-1"
        },
        {
            "AbsEntry": 8048,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F25-2"
        },
        {
            "AbsEntry": 8049,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F25-3"
        },
        {
            "AbsEntry": 8050,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F26-1"
        },
        {
            "AbsEntry": 8051,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F26-2"
        },
        {
            "AbsEntry": 8052,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F26-3"
        },
        {
            "AbsEntry": 8053,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F27-1"
        },
        {
            "AbsEntry": 8054,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F27-2"
        },
        {
            "AbsEntry": 8055,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F27-3"
        },
        {
            "AbsEntry": 8056,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F28-1"
        },
        {
            "AbsEntry": 8057,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F28-2"
        },
        {
            "AbsEntry": 8058,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8F28-3"
        },
        {
            "AbsEntry": 8059,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G01-1"
        },
        {
            "AbsEntry": 8060,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G01-2"
        },
        {
            "AbsEntry": 8061,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G01-3"
        },
        {
            "AbsEntry": 8062,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G02-1"
        },
        {
            "AbsEntry": 8063,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G02-2"
        },
        {
            "AbsEntry": 8064,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G02-3"
        },
        {
            "AbsEntry": 8065,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G03-1"
        },
        {
            "AbsEntry": 8066,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G03-2"
        },
        {
            "AbsEntry": 8067,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G03-3"
        },
        {
            "AbsEntry": 8068,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G04-1"
        },
        {
            "AbsEntry": 8069,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G04-2"
        },
        {
            "AbsEntry": 8070,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G04-3"
        },
        {
            "AbsEntry": 8071,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G05-1"
        },
        {
            "AbsEntry": 8072,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G05-2"
        },
        {
            "AbsEntry": 8073,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G05-3"
        },
        {
            "AbsEntry": 8074,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G06-1"
        },
        {
            "AbsEntry": 8075,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G06-2"
        },
        {
            "AbsEntry": 8076,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G06-3"
        },
        {
            "AbsEntry": 8077,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G07-1"
        },
        {
            "AbsEntry": 8078,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G07-2"
        },
        {
            "AbsEntry": 8079,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G07-3"
        },
        {
            "AbsEntry": 8080,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G08-1"
        },
        {
            "AbsEntry": 8081,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G08-2"
        },
        {
            "AbsEntry": 8082,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G08-3"
        },
        {
            "AbsEntry": 8083,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G09-1"
        },
        {
            "AbsEntry": 8084,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G09-2"
        },
        {
            "AbsEntry": 8085,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G09-3"
        },
        {
            "AbsEntry": 8086,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G10-1"
        },
        {
            "AbsEntry": 8087,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G10-2"
        },
        {
            "AbsEntry": 8088,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G10-3"
        },
        {
            "AbsEntry": 8089,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G11-1"
        },
        {
            "AbsEntry": 8090,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G11-2"
        },
        {
            "AbsEntry": 8091,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G11-3"
        },
        {
            "AbsEntry": 8092,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G12-1"
        },
        {
            "AbsEntry": 8093,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G12-2"
        },
        {
            "AbsEntry": 8094,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G12-3"
        },
        {
            "AbsEntry": 8095,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G13-1"
        },
        {
            "AbsEntry": 8096,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G13-2"
        },
        {
            "AbsEntry": 8097,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G13-3"
        },
        {
            "AbsEntry": 8098,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G14-1"
        },
        {
            "AbsEntry": 8099,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G14-2"
        },
        {
            "AbsEntry": 8100,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G14-3"
        },
        {
            "AbsEntry": 8101,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G15-1"
        },
        {
            "AbsEntry": 8102,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G15-2"
        },
        {
            "AbsEntry": 8103,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G15-3"
        },
        {
            "AbsEntry": 8104,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G16-1"
        },
        {
            "AbsEntry": 8105,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G16-2"
        },
        {
            "AbsEntry": 8106,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G16-3"
        },
        {
            "AbsEntry": 8107,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G17-1"
        },
        {
            "AbsEntry": 8108,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G17-2"
        },
        {
            "AbsEntry": 8109,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G17-3"
        },
        {
            "AbsEntry": 8110,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G18-1"
        },
        {
            "AbsEntry": 8111,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G18-2"
        },
        {
            "AbsEntry": 8112,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G18-3"
        },
        {
            "AbsEntry": 8113,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G19-1"
        },
        {
            "AbsEntry": 8114,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G19-2"
        },
        {
            "AbsEntry": 8115,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G19-3"
        },
        {
            "AbsEntry": 8116,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G20-1"
        },
        {
            "AbsEntry": 8117,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G20-2"
        },
        {
            "AbsEntry": 8118,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G20-3"
        },
        {
            "AbsEntry": 8119,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G21-1"
        },
        {
            "AbsEntry": 8120,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G21-2"
        },
        {
            "AbsEntry": 8121,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G21-3"
        },
        {
            "AbsEntry": 8122,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G22-1"
        },
        {
            "AbsEntry": 8123,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G22-2"
        },
        {
            "AbsEntry": 8124,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G22-3"
        },
        {
            "AbsEntry": 8125,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G23-1"
        },
        {
            "AbsEntry": 8126,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G23-2"
        },
        {
            "AbsEntry": 8127,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G23-3"
        },
        {
            "AbsEntry": 8128,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G24-1"
        },
        {
            "AbsEntry": 8129,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G24-2"
        },
        {
            "AbsEntry": 8130,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G24-3"
        },
        {
            "AbsEntry": 8131,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G25-1"
        },
        {
            "AbsEntry": 8132,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G25-2"
        },
        {
            "AbsEntry": 8133,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G25-3"
        },
        {
            "AbsEntry": 8134,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G26-1"
        },
        {
            "AbsEntry": 8135,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G26-2"
        },
        {
            "AbsEntry": 8136,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G26-3"
        },
        {
            "AbsEntry": 8137,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G27-1"
        },
        {
            "AbsEntry": 8138,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G27-2"
        },
        {
            "AbsEntry": 8139,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G27-3"
        },
        {
            "AbsEntry": 8140,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G28-1"
        },
        {
            "AbsEntry": 8141,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G28-2"
        },
        {
            "AbsEntry": 8142,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8G28-3"
        },
        {
            "AbsEntry": 8143,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H01-1"
        },
        {
            "AbsEntry": 8144,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H01-2"
        },
        {
            "AbsEntry": 8145,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H01-3"
        },
        {
            "AbsEntry": 8146,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H02-1"
        },
        {
            "AbsEntry": 8147,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H02-2"
        },
        {
            "AbsEntry": 8148,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H02-3"
        },
        {
            "AbsEntry": 8149,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H03-1"
        },
        {
            "AbsEntry": 8150,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H03-2"
        },
        {
            "AbsEntry": 8151,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H03-3"
        },
        {
            "AbsEntry": 8152,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H04-1"
        },
        {
            "AbsEntry": 8153,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H04-2"
        },
        {
            "AbsEntry": 8154,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H04-3"
        },
        {
            "AbsEntry": 8155,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H05-1"
        },
        {
            "AbsEntry": 8156,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H05-2"
        },
        {
            "AbsEntry": 8157,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H05-3"
        },
        {
            "AbsEntry": 8158,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H06-1"
        },
        {
            "AbsEntry": 8159,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H06-2"
        },
        {
            "AbsEntry": 8160,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H06-3"
        },
        {
            "AbsEntry": 8161,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H07-1"
        },
        {
            "AbsEntry": 8162,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H07-2"
        },
        {
            "AbsEntry": 8163,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H07-3"
        },
        {
            "AbsEntry": 8164,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H08-1"
        },
        {
            "AbsEntry": 8165,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H08-2"
        },
        {
            "AbsEntry": 8166,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H08-3"
        },
        {
            "AbsEntry": 8167,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H09-1"
        },
        {
            "AbsEntry": 8168,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H09-2"
        },
        {
            "AbsEntry": 8169,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H09-3"
        },
        {
            "AbsEntry": 8170,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H10-1"
        },
        {
            "AbsEntry": 8171,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H10-2"
        },
        {
            "AbsEntry": 8172,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H10-3"
        },
        {
            "AbsEntry": 8173,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H11-1"
        },
        {
            "AbsEntry": 8174,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H11-2"
        },
        {
            "AbsEntry": 8175,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H11-3"
        },
        {
            "AbsEntry": 8176,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H12-1"
        },
        {
            "AbsEntry": 8177,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H12-2"
        },
        {
            "AbsEntry": 8178,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H12-3"
        },
        {
            "AbsEntry": 8179,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H13-1"
        },
        {
            "AbsEntry": 8180,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H13-2"
        },
        {
            "AbsEntry": 8181,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H13-3"
        },
        {
            "AbsEntry": 8182,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H14-1"
        },
        {
            "AbsEntry": 8183,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H14-2"
        },
        {
            "AbsEntry": 8184,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H14-3"
        },
        {
            "AbsEntry": 8185,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H15-1"
        },
        {
            "AbsEntry": 8186,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H15-2"
        },
        {
            "AbsEntry": 8187,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H15-3"
        },
        {
            "AbsEntry": 8188,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H16-1"
        },
        {
            "AbsEntry": 8189,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H16-2"
        },
        {
            "AbsEntry": 8190,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H16-3"
        },
        {
            "AbsEntry": 8191,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H17-1"
        },
        {
            "AbsEntry": 8192,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H17-2"
        },
        {
            "AbsEntry": 8193,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H17-3"
        },
        {
            "AbsEntry": 8194,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H18-1"
        },
        {
            "AbsEntry": 8195,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H18-2"
        },
        {
            "AbsEntry": 8196,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H18-3"
        },
        {
            "AbsEntry": 8197,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H19-1"
        },
        {
            "AbsEntry": 8198,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H19-2"
        },
        {
            "AbsEntry": 8199,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H19-3"
        },
        {
            "AbsEntry": 8200,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H20-1"
        },
        {
            "AbsEntry": 8201,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H20-2"
        },
        {
            "AbsEntry": 8202,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H20-3"
        },
        {
            "AbsEntry": 8203,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H21-1"
        },
        {
            "AbsEntry": 8204,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H21-2"
        },
        {
            "AbsEntry": 8205,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H21-3"
        },
        {
            "AbsEntry": 8206,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H22-1"
        },
        {
            "AbsEntry": 8207,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H22-2"
        },
        {
            "AbsEntry": 8208,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H22-3"
        },
        {
            "AbsEntry": 8209,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H23-1"
        },
        {
            "AbsEntry": 8210,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H23-2"
        },
        {
            "AbsEntry": 8211,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H23-3"
        },
        {
            "AbsEntry": 8212,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H24-1"
        },
        {
            "AbsEntry": 8213,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H24-2"
        },
        {
            "AbsEntry": 8214,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H24-3"
        },
        {
            "AbsEntry": 8215,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H25-1"
        },
        {
            "AbsEntry": 8216,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H25-2"
        },
        {
            "AbsEntry": 8217,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H25-3"
        },
        {
            "AbsEntry": 8218,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H26-1"
        },
        {
            "AbsEntry": 8219,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H26-2"
        },
        {
            "AbsEntry": 8220,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H26-3"
        },
        {
            "AbsEntry": 8221,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H27-1"
        },
        {
            "AbsEntry": 8222,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H27-2"
        },
        {
            "AbsEntry": 8223,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H27-3"
        },
        {
            "AbsEntry": 8224,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H28-1"
        },
        {
            "AbsEntry": 8225,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H28-2"
        },
        {
            "AbsEntry": 8226,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8H28-3"
        },
        {
            "AbsEntry": 8227,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I01-1"
        },
        {
            "AbsEntry": 8228,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I01-2"
        },
        {
            "AbsEntry": 8229,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I01-3"
        },
        {
            "AbsEntry": 8230,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I02-1"
        },
        {
            "AbsEntry": 8231,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I02-2"
        },
        {
            "AbsEntry": 8232,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I02-3"
        },
        {
            "AbsEntry": 8233,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I03-1"
        },
        {
            "AbsEntry": 8234,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I03-2"
        },
        {
            "AbsEntry": 8235,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I03-3"
        },
        {
            "AbsEntry": 8236,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I04-1"
        },
        {
            "AbsEntry": 8237,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I04-2"
        },
        {
            "AbsEntry": 8238,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I04-3"
        },
        {
            "AbsEntry": 8239,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I05-1"
        },
        {
            "AbsEntry": 8240,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I05-2"
        },
        {
            "AbsEntry": 8241,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I05-3"
        },
        {
            "AbsEntry": 8242,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I06-1"
        },
        {
            "AbsEntry": 8243,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I06-2"
        },
        {
            "AbsEntry": 8244,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I06-3"
        },
        {
            "AbsEntry": 8245,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I07-1"
        },
        {
            "AbsEntry": 8246,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I07-2"
        },
        {
            "AbsEntry": 8247,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I07-3"
        },
        {
            "AbsEntry": 8248,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I08-1"
        },
        {
            "AbsEntry": 8249,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I08-2"
        },
        {
            "AbsEntry": 8250,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I08-3"
        },
        {
            "AbsEntry": 8251,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I09-1"
        },
        {
            "AbsEntry": 8252,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I09-2"
        },
        {
            "AbsEntry": 8253,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I09-3"
        },
        {
            "AbsEntry": 8254,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I10-1"
        },
        {
            "AbsEntry": 8255,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I10-2"
        },
        {
            "AbsEntry": 8256,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I10-3"
        },
        {
            "AbsEntry": 8257,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I11-1"
        },
        {
            "AbsEntry": 8258,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I11-2"
        },
        {
            "AbsEntry": 8259,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I11-3"
        },
        {
            "AbsEntry": 8260,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I12-1"
        },
        {
            "AbsEntry": 8261,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I12-2"
        },
        {
            "AbsEntry": 8262,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I12-3"
        },
        {
            "AbsEntry": 8263,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I13-1"
        },
        {
            "AbsEntry": 8264,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I13-2"
        },
        {
            "AbsEntry": 8265,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I13-3"
        },
        {
            "AbsEntry": 8266,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I14-1"
        },
        {
            "AbsEntry": 8267,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I14-2"
        },
        {
            "AbsEntry": 8268,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I14-3"
        },
        {
            "AbsEntry": 8269,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I15-1"
        },
        {
            "AbsEntry": 8270,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I15-2"
        },
        {
            "AbsEntry": 8271,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I15-3"
        },
        {
            "AbsEntry": 8272,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I16-1"
        },
        {
            "AbsEntry": 8273,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I16-2"
        },
        {
            "AbsEntry": 8274,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I16-3"
        },
        {
            "AbsEntry": 8275,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I17-1"
        },
        {
            "AbsEntry": 8276,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I17-2"
        },
        {
            "AbsEntry": 8277,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I17-3"
        },
        {
            "AbsEntry": 8278,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I18-1"
        },
        {
            "AbsEntry": 8279,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I18-2"
        },
        {
            "AbsEntry": 8280,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I18-3"
        },
        {
            "AbsEntry": 8281,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I19-1"
        },
        {
            "AbsEntry": 8282,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I19-2"
        },
        {
            "AbsEntry": 8283,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I19-3"
        },
        {
            "AbsEntry": 8284,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I20-1"
        },
        {
            "AbsEntry": 8285,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I20-2"
        },
        {
            "AbsEntry": 8286,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I20-3"
        },
        {
            "AbsEntry": 8287,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I21-1"
        },
        {
            "AbsEntry": 8288,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I21-2"
        },
        {
            "AbsEntry": 8289,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I21-3"
        },
        {
            "AbsEntry": 8290,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I22-1"
        },
        {
            "AbsEntry": 8291,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I22-2"
        },
        {
            "AbsEntry": 8292,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I22-3"
        },
        {
            "AbsEntry": 8293,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I23-1"
        },
        {
            "AbsEntry": 8294,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I23-2"
        },
        {
            "AbsEntry": 8295,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I23-3"
        },
        {
            "AbsEntry": 8296,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I24-1"
        },
        {
            "AbsEntry": 8297,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I24-2"
        },
        {
            "AbsEntry": 8298,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I24-3"
        },
        {
            "AbsEntry": 8299,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I25-1"
        },
        {
            "AbsEntry": 8300,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I25-2"
        },
        {
            "AbsEntry": 8301,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I25-3"
        },
        {
            "AbsEntry": 8302,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I26-1"
        },
        {
            "AbsEntry": 8303,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I26-2"
        },
        {
            "AbsEntry": 8304,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I26-3"
        },
        {
            "AbsEntry": 8305,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I27-1"
        },
        {
            "AbsEntry": 8306,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I27-2"
        },
        {
            "AbsEntry": 8307,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I27-3"
        },
        {
            "AbsEntry": 8308,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I28-1"
        },
        {
            "AbsEntry": 8309,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I28-2"
        },
        {
            "AbsEntry": 8310,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8I28-3"
        },
        {
            "AbsEntry": 8524,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8J01-1"
        },
        {
            "AbsEntry": 8525,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8J02-1"
        },
        {
            "AbsEntry": 8526,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8J03-1"
        },
        {
            "AbsEntry": 8527,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8J04-1"
        },
        {
            "AbsEntry": 8528,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8J05-1"
        },
        {
            "AbsEntry": 8529,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8J05-2"
        },
        {
            "AbsEntry": 8530,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K01-1"
        },
        {
            "AbsEntry": 8531,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K01-2"
        },
        {
            "AbsEntry": 8532,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K01-3"
        },
        {
            "AbsEntry": 8533,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K02-1"
        },
        {
            "AbsEntry": 8534,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K02-2"
        },
        {
            "AbsEntry": 8535,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K02-3"
        },
        {
            "AbsEntry": 8536,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K03-1"
        },
        {
            "AbsEntry": 8537,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K03-2"
        },
        {
            "AbsEntry": 8538,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K03-3"
        },
        {
            "AbsEntry": 8539,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K04-1"
        },
        {
            "AbsEntry": 8540,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K04-2"
        },
        {
            "AbsEntry": 8541,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K04-3"
        },
        {
            "AbsEntry": 8542,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K05-1"
        },
        {
            "AbsEntry": 8543,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K05-2"
        },
        {
            "AbsEntry": 8544,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K05-3"
        },
        {
            "AbsEntry": 8545,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K06-1"
        },
        {
            "AbsEntry": 8546,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K06-2"
        },
        {
            "AbsEntry": 8547,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K06-3"
        },
        {
            "AbsEntry": 8548,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K07-1"
        },
        {
            "AbsEntry": 8549,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K07-2"
        },
        {
            "AbsEntry": 8550,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K07-3"
        },
        {
            "AbsEntry": 8551,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K08-1"
        },
        {
            "AbsEntry": 8552,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K08-2"
        },
        {
            "AbsEntry": 8553,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K08-3"
        },
        {
            "AbsEntry": 8554,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K09-03"
        },
        {
            "AbsEntry": 8555,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8K10-03"
        },
        {
            "AbsEntry": 8556,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L01-1"
        },
        {
            "AbsEntry": 8557,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L01-2"
        },
        {
            "AbsEntry": 8558,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L01-3"
        },
        {
            "AbsEntry": 8559,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L02-1"
        },
        {
            "AbsEntry": 8560,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L02-2"
        },
        {
            "AbsEntry": 8561,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L02-3"
        },
        {
            "AbsEntry": 8562,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L03-1"
        },
        {
            "AbsEntry": 8563,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L03-2"
        },
        {
            "AbsEntry": 8564,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L03-3"
        },
        {
            "AbsEntry": 8565,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L04-1"
        },
        {
            "AbsEntry": 8566,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L04-2"
        },
        {
            "AbsEntry": 8567,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L04-3"
        },
        {
            "AbsEntry": 8568,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L05-1"
        },
        {
            "AbsEntry": 8569,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L05-2"
        },
        {
            "AbsEntry": 8570,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L05-3"
        },
        {
            "AbsEntry": 8571,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L06-1"
        },
        {
            "AbsEntry": 8572,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L06-2"
        },
        {
            "AbsEntry": 8573,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L06-3"
        },
        {
            "AbsEntry": 8574,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L07-1"
        },
        {
            "AbsEntry": 8575,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L07-2"
        },
        {
            "AbsEntry": 8576,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L07-3"
        },
        {
            "AbsEntry": 8577,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L08-1"
        },
        {
            "AbsEntry": 8578,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L08-2"
        },
        {
            "AbsEntry": 8579,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L08-3"
        },
        {
            "AbsEntry": 8580,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L09-1"
        },
        {
            "AbsEntry": 8581,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L09-2"
        },
        {
            "AbsEntry": 8582,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L09-3"
        },
        {
            "AbsEntry": 8583,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L10-1"
        },
        {
            "AbsEntry": 8584,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L10-2"
        },
        {
            "AbsEntry": 8585,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-8L10-3"
        },
        {
            "AbsEntry": 8736,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C00059"
        },
        {
            "AbsEntry": 8737,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C00205"
        },
        {
            "AbsEntry": 8738,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C00855"
        },
        {
            "AbsEntry": 8739,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C01209"
        },
        {
            "AbsEntry": 8740,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C01210"
        },
        {
            "AbsEntry": 8741,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C01324"
        },
        {
            "AbsEntry": 8742,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C01338"
        },
        {
            "AbsEntry": 8743,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C01670"
        },
        {
            "AbsEntry": 8744,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C01721"
        },
        {
            "AbsEntry": 8745,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C01991"
        },
        {
            "AbsEntry": 8746,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02001"
        },
        {
            "AbsEntry": 8747,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02012"
        },
        {
            "AbsEntry": 8748,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02049"
        },
        {
            "AbsEntry": 8749,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02050"
        },
        {
            "AbsEntry": 8750,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02072"
        },
        {
            "AbsEntry": 8751,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02111"
        },
        {
            "AbsEntry": 8752,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02117"
        },
        {
            "AbsEntry": 8753,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02143"
        },
        {
            "AbsEntry": 8754,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02212"
        },
        {
            "AbsEntry": 8755,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02263"
        },
        {
            "AbsEntry": 8756,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02281"
        },
        {
            "AbsEntry": 8757,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02308"
        },
        {
            "AbsEntry": 8758,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02344"
        },
        {
            "AbsEntry": 8759,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02386"
        },
        {
            "AbsEntry": 8760,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02416"
        },
        {
            "AbsEntry": 8761,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02417"
        },
        {
            "AbsEntry": 8762,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02418"
        },
        {
            "AbsEntry": 8763,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02445"
        },
        {
            "AbsEntry": 8764,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02471"
        },
        {
            "AbsEntry": 8765,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02500"
        },
        {
            "AbsEntry": 8766,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02522"
        },
        {
            "AbsEntry": 8767,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02523"
        },
        {
            "AbsEntry": 8768,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02524"
        },
        {
            "AbsEntry": 8769,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02535"
        },
        {
            "AbsEntry": 8770,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02555"
        },
        {
            "AbsEntry": 8771,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02634"
        },
        {
            "AbsEntry": 8772,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02636"
        },
        {
            "AbsEntry": 8773,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02659"
        },
        {
            "AbsEntry": 8774,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-C02670"
        },
        {
            "AbsEntry": 19,
            "Warehouse": "WIQ",
            "BinCode": "WIQ-SYSTEM-BIN-LOCATION"
        }
    ]
}
*/

});

// Batch in Bin and Qty
app.post("/api/batchinbin", async (req, res) => {
  console.log("req.body:", req.body);
  const getBatchInBinBaseURL = `https://192.168.0.44:50000/b1s/v1/view.svc/Homart_BatchInBinQty_B1SLQuery()?$filter=DistNumber eq '${req.body.BatchNumber}' and OnHandQty gt 0`;
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
  console.log("req.body:", req.body);
  const getJournalMemoBaseURL = `https://192.168.0.44:50000/b1s/v1/view.svc/Homart_JournalMemo_B1SLQuery()`;
  console.log(getJournalMemoBaseURL);
  console.log("sessionObj.sessionId: " + sessionObj.sessionId);
  try {
    const response = await axios.get(getJournalMemoBaseURL, {
      withCredentials: true,
      headers: {
        Cookie: sessionObj.sessionId,
        Prefer: "odata.maxpagesize=9999999999",
      },
    });
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

app.listen(port, () => {
  console.log("Server listening on port " + port);
  loginToSAPSession();
  setInterval(loginToSAPSession, 28 * 60 * 1000);
});
