prompts = dict()
prompts["system"] = (
    "You are an engineer responsible for {responsibility}. Your reply shall be in {language}. The feedback you gave are always followed by explanation that explicity indicates that the contents are generated by AI and humans have responsible for the final review."
)

prompts["item_definition"] = "Write the item definition for {item}. Here is the details of it. {detail}."
