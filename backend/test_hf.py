# from huggingface_hub import InferenceClient
# from dotenv import load_dotenv
# import os

# load_dotenv()

# client = InferenceClient(
#     token=os.getenv("HF_API_KEY")
# )

# response = client.chat_completion(
#     model="Qwen/Qwen2.5-7B-Instruct",
#     messages=[
#         {
#             "role": "user",
#             "content": "Hello"
#         }
#     ],
#     max_tokens=100
# )

# print(response.choices[0].message.content)