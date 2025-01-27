from transformers import pipeline

classifier = pipeline("sentiment-analysis")

input = """
This is a test and I hate testing stuff. It really bugs me.
"""

print(classifier(input))