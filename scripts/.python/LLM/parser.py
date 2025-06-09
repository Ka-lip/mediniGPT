import argparse

parser = argparse.ArgumentParser(description="Process item definition arguments.")

parser.add_argument(
    "--if",
    dest="interface",
    choices=["medini", "terminal"],
    # TODO in the case `medini`, CRUD json can be implemented for brevity.
    default="terminal",
    help="Interface type (default: terminal). Allowed values: medini, terminal.",
)
parser.add_argument("--lang", default="English", help="Language (default: English).")
parser.add_argument(
    "--responsibility",
    default="ISO26262",
    help="Responsibility (default: ISO26262).",
)
