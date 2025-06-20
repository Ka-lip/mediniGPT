from langchain_core.prompts import ChatPromptTemplate
from prompts import prompts
import model_init
from parser import parser


def main():
    parser.add_argument("--item", required=True, help="Item name (required).")
    parser.add_argument("--detail", help="Details of this item")

    args = parser.parse_args()

    prompt_template = ChatPromptTemplate.from_messages(
        [
            ("system", prompts["system"]),
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
    response = model_init.llm_model.invoke(prompt)
    print(response.content)


if __name__ == "__main__":
    main()
