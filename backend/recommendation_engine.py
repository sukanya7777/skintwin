
def generate_skincare_plan(youcam_results, concerns=None, sensitivities=None):
    """
    Generate an ingredient-focused skincare plan from YouCam results.
    This is a rule-based educational recommendation engine,
    not a medical diagnosis.
    """

    concerns = concerns or []
    sensitivities = sensitivities or []

    output = youcam_results.get("output", [])

    # Extract detected skin type.
    skin_type_record = next(
        (
            item for item in output
            if item.get("type") == "hd_skin_type"
            and item.get("region") == "whole"
        ),
        None,
    )

    skin_type = (
        skin_type_record.get("skin_type", "").lower()
        if skin_type_record else "unknown"
    )

    # Ingredient catalogue.
    ingredients = {
        "niacinamide": {
            "name": "Niacinamide",
            "benefit": "May help manage excess oil and support the skin barrier.",
            "use": "Morning or evening",
        },
        "glycerin": {
            "name": "Glycerin",
            "benefit": "Helps attract and retain moisture in the skin.",
            "use": "Morning and evening",
        },
        "hyaluronic_acid": {
            "name": "Hyaluronic Acid",
            "benefit": "Helps maintain skin hydration.",
            "use": "Morning or evening",
        },
        "ceramides": {
            "name": "Ceramides",
            "benefit": "Help support the skin's protective barrier.",
            "use": "Morning and evening",
        },
        "panthenol": {
            "name": "Panthenol",
            "benefit": "Helps moisturise and support the skin barrier.",
            "use": "Morning or evening",
        },
        "salicylic_acid": {
            "name": "Salicylic Acid",
            "benefit": "Can help unclog pores and manage acne-prone skin.",
            "use": "Evening, introduced gradually",
        },
        "azelaic_acid": {
            "name": "Azelaic Acid",
            "benefit": "May help with uneven tone and blemish-related marks.",
            "use": "Evening, if appropriate",
        },
        "vitamin_c": {
            "name": "Vitamin C",
            "benefit": "An antioxidant that may help with uneven skin tone.",
            "use": "Morning",
        },
    }

    selected = []

    def add_ingredient(key):
        if key not in selected and key in ingredients:
            selected.append(key)

    # Base recommendations according to detected skin type.
    if skin_type == "oily":
        add_ingredient("niacinamide")
        add_ingredient("glycerin")
        add_ingredient("ceramides")

    elif skin_type == "dry":
        add_ingredient("glycerin")
        add_ingredient("hyaluronic_acid")
        add_ingredient("ceramides")
        add_ingredient("panthenol")

    elif skin_type == "combination":
        add_ingredient("niacinamide")
        add_ingredient("glycerin")
        add_ingredient("ceramides")

    elif skin_type == "normal":
        add_ingredient("glycerin")
        add_ingredient("ceramides")

    else:
        add_ingredient("glycerin")
        add_ingredient("ceramides")

    # Additional ingredients based on user-reported concerns.
    concern_set = {item.lower().strip() for item in concerns}

    if concern_set.intersection({"acne", "breakouts", "clogged pores"}):
        add_ingredient("salicylic_acid")

    if concern_set.intersection({"uneven tone", "dark spots", "pigmentation"}):
        add_ingredient("azelaic_acid")
        add_ingredient("vitamin_c")

    if concern_set.intersection({"dryness", "dehydration"}):
        add_ingredient("hyaluronic_acid")
        add_ingredient("panthenol")

    if concern_set.intersection({"redness", "sensitivity"}):
        add_ingredient("panthenol")
        add_ingredient("ceramides")

    # Remove ingredients the user reports sensitivity to.
    sensitivity_set = {
        item.lower().strip() for item in sensitivities
    }

    selected = [
        key for key in selected
        if key not in sensitivity_set
    ]

    ingredient_guide = [
        ingredients[key] for key in selected
    ]

    # Keep routines simple.
    morning = [
        {
            "step": "Cleanse",
            "guidance": "Use a gentle, non-stripping cleanser."
        },
        {
            "step": "Hydrate",
            "ingredients": [
                key for key in selected
                if key in ["glycerin", "hyaluronic_acid", "niacinamide"]
            ]
        },
        {
            "step": "Moisturise",
            "ingredients": [
                key for key in selected
                if key in ["ceramides", "panthenol"]
            ]
        },
        {
            "step": "Sun protection",
            "guidance": "Finish with broad-spectrum SPF 30 or higher."
        },
    ]

    evening = [
        {
            "step": "Cleanse",
            "guidance": "Gently remove sunscreen, makeup and daily buildup."
        },
        {
            "step": "Targeted care",
            "ingredients": [
                key for key in selected
                if key in ["salicylic_acid", "azelaic_acid"]
            ],
            "guidance": "Introduce active ingredients gradually and follow product instructions."
        },
        {
            "step": "Moisturise",
            "ingredients": [
                key for key in selected
                if key in ["glycerin", "ceramides", "panthenol"]
            ]
        },
    ]

    return {
        "skin_type": skin_type.title(),
        "skin_type_source": "YouCam Skin Analysis",
        "ingredients": ingredient_guide,
        "morning_routine": morning,
        "evening_routine": evening,
        "important_notes": [
            "Patch test new skincare products.",
            "Introduce one new active ingredient at a time.",
            "Avoid ingredients that cause irritation or known allergic reactions.",
            "Use sunscreen every morning.",
            "These are educational suggestions, not medical advice."
        ]
    }
