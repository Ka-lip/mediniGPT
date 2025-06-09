from langchain_core.prompts import ChatPromptTemplate
from prompts import prompts
import model_init
from parser import parser


def main():
    parser.add_argument("--event", required=True, help="FTA event name (required).")
    parser.add_argument("--reasoning", help="The way to derive sub-events")

    args = parser.parse_args()

    prompt_template = ChatPromptTemplate.from_messages(
        [("system", prompts["system"]), ("user", prompts["fta"])]
    )

    prompt = prompt_template.invoke(
        {
            "language": args.lang,
            "responsibility": args.responsibility,
            "event": args.event,
            "reasoning": args.reasoning,
        }
    )
    response = model_init.llm_model.invoke(prompt)
    print(response.content)


if __name__ == "__main__":
    main()
