import argparse
from langchain_core.prompts import ChatPromptTemplate
from prompts import prompts
import model_init


def main():
    parser = argparse.ArgumentParser(description="Process item definition arguments.")

    parser.add_argument(
        "--if",
        dest="interface",
        choices=["medini", "terminal"],
        # TODO in the case `medini`, CRUD json can be implemented for brevity.
        default="terminal",
        help="Interface type (default: terminal). Allowed values: medini, terminal.",
    )
    parser.add_argument(
        "--lang", default="English", help="Language (default: English)."
    )
    parser.add_argument("--item", required=True, help="Item name (required).")
    parser.add_argument(
        "--responsibility",
        default="ISO26262",
        help="Responsibility (default: ISO26262).",
    )
    parser.add_argument("--detail", help="Details of this item")

    args = parser.parse_args()

    prompt_template = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                prompts["system"],
            ),
            ("user", prompts["item_definition"]),
        ]
    )

    prompt = prompt_template.invoke(
        {
            "language": args.lang,
            "item": args.item,
            "responsibility": args.responsibility,
            "detail": args.detail,
        }
    )
    response = model_init.model.invoke(prompt)
    print(response.content)


if __name__ == "__main__":
    main()
