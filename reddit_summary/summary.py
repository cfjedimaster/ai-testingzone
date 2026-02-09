import os
from google import genai
from google.genai import types

client = genai.Client(
    api_key=os.environ.get("GEMINI_API_KEY"),
)
model = "gemini-flash-latest"

def summarize():

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""Look at this page in Reddit (https://www.reddit.com/r/astrojs/new/) and scan the titles of the most recent posts to see if anything needs a developer to respond or is overly critical of Astro. When reporting on threads, always include the URL to the thread."""),
            ],
        ),
    ]
    tools = [
        types.Tool(url_context=types.UrlContext()),
    ]
    generate_content_config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_budget=0,
        ),
        tools=tools,
    )

    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=generate_content_config,
    )

    return response.text

def turn_to_json(input):

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=f"""
I used a previous prompt to parse a URL and provide a report on issues that need a developer, and issues that reflect on the technology.

That prompt made use of URL tools and the SDK does not allow you to create structured output. So I want you to take the output and return it in my designed JSON format. Here is the previous output, in Markdown:
                                     
{input}                                     
"""),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_budget=0,
        ),
        response_mime_type="application/json",
        response_schema=genai.types.Schema(
            type = genai.types.Type.OBJECT,
            required = ["posts"],
            properties = {
                "posts": genai.types.Schema(
                    type = genai.types.Type.ARRAY,
                    items = genai.types.Schema(
                        type = genai.types.Type.OBJECT,
                        required = ["title", "reason", "url"],
                        properties = {
                            "title": genai.types.Schema(
                                type = genai.types.Type.STRING,
                            ),
                            "reason": genai.types.Schema(
                                type = genai.types.Type.STRING,
                            ),
                            "url": genai.types.Schema(
                                type = genai.types.Type.STRING,
                            ),
                        },
                    ),
                ),
            },
        ),
    )

    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=generate_content_config,
    )

    return response.text

if __name__ == "__main__":
    summary = summarize()
    json = turn_to_json(summary)
    print(json)


