select sto_product.TypeID, sto_product.Image, sto_product.Name,sto_product.Model, sto_product.UnitID, sto_product_attr.BarCode, sto_product_attr.{Price} as Price, sto_balance.Qty from sto_product_attr 
left join sto_product on (sto_product.ID =  sto_product_attr.ProductID)
left join sto_balance on (sto_product_attr.barcode = sto_balance.Product and sto_balance.BranchID =1) 