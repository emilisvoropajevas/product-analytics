import pandas as pd
from io import BytesIO

required_columns = ['Order Date', 'Order ID', 'Product SKU', 'Product Name', 'Qty Ordered', 'Price']
chunk_size = 10

def clean_and_format_csv(csv_file):
    try:
        uploaded_file_as_dataframe = pd.read_csv(BytesIO(csv_file))
    except Exception:
        raise ValueError("Could not parse CSV file")
    if uploaded_file_as_dataframe.empty:
        raise ValueError("CSV file is empty")
    
    missing_columns = set(required_columns) - set(uploaded_file_as_dataframe.columns)
    if missing_columns:
        raise ValueError(f"Column {missing_columns} missing from data")
    
    #Perform global checks FIRST
    uploaded_file_as_dataframe['Order Date'] = (pd.to_datetime(uploaded_file_as_dataframe['Order Date'], format='%Y-%m-%d %H:%M:%S', errors = 'coerce')).dt.normalize()
    if uploaded_file_as_dataframe['Order Date'].isnull().sum() / len(uploaded_file_as_dataframe['Order Date']) > 0.1: 
        raise ValueError("Too many null dates")
    else:
        uploaded_file_as_dataframe = uploaded_file_as_dataframe.dropna(subset=['Order Date']) #Global check
    uploaded_file_as_dataframe = uploaded_file_as_dataframe.sort_values(by = 'Order Date', ascending= True).reset_index(drop = True) #Global check

    #Now execute loop and yield chunks

    for i in range(0, len(uploaded_file_as_dataframe), chunk_size):
        report_chunk = uploaded_file_as_dataframe.iloc[i:i+chunk_size]

        report_chunk = report_chunk[['Order Date', 'Order ID', 'Product SKU', 'Product Name', 'Qty Ordered', 'Price']].copy()
    
        report_chunk = report_chunk[report_chunk['Product SKU'].str.contains("-f", na = False)]

        report_chunk['Model Range'] = report_chunk['Product SKU'].str.rsplit("/", n=1).str[0]

        report_chunk = report_chunk.rename(columns={
            "Order Date": "order_date",
            "Order ID": "order_id",
            "Product SKU": "product_sku",
            "Product Name": "product_name",
            "Qty Ordered": "qty_ordered",
            "Price": "price",
            "Model Range": "model_range"

        })
        yield report_chunk.to_dict(orient="records")