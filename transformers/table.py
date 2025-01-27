from transformers import pipeline
import pandas as pd

# prepare table + question
data = {"Actors": ["Brad Pitt", "Leonardo Di Caprio", "George Clooney"], "Number of movies": ["87", "53", "69"]}
table = pd.DataFrame.from_dict(data)
question = "how many movies does Leonardo Di Caprio have?"

# pipeline model
# Note: you must to install torch-scatter first.
tqa = pipeline(task="table-question-answering", model="google/tapas-large-finetuned-wtq")

# result

print("\n\n")
print(tqa(table=table, query=question)['cells'][0])

print("\n\n")
print(tqa(table=table, query="Who has the highest number of movies?")['cells'][0])