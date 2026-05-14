"""
Label maps aligned with sklearn.preprocessing.LabelEncoder on dataset/train.csv
(Item_Type and Outlet_Identifier), so API responses match model training.
"""

ITEM_TYPE_LABELS = {
    0: "Baking Goods",
    1: "Breads",
    2: "Breakfast",
    3: "Canned",
    4: "Dairy",
    5: "Frozen Foods",
    6: "Fruits and Vegetables",
    7: "Hard Drinks",
    8: "Health and Hygiene",
    9: "Household",
    10: "Meat",
    11: "Others",
    12: "Seafood",
    13: "Snack Foods",
    14: "Soft Drinks",
    15: "Starchy Foods",
}

# Outlet_Identifier classes sorted as in LabelEncoder.fit(train['Outlet_Identifier'])
OUTLET_IDENTIFIER_LABELS = {
    0: "OUT010",
    1: "OUT013",
    2: "OUT017",
    3: "OUT018",
    4: "OUT019",
    5: "OUT027",
    6: "OUT035",
    7: "OUT045",
    8: "OUT046",
    9: "OUT049",
}


def item_type_name(code: int) -> str:
    return ITEM_TYPE_LABELS.get(int(code), f"Item type {code}")


def outlet_identifier_name(code: int) -> str:
    return OUTLET_IDENTIFIER_LABELS.get(int(code), f"Outlet {code}")
