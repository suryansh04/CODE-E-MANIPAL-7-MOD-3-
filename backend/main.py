from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
from typing import Optional
import json
import re
import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

# Import API libraries after environment is loaded
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import PromptTemplate
from langchain_community.utilities import WikipediaAPIWrapper

# Get API keys
anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
google_api_key = os.getenv("GOOGLE_API_KEY")

# Initialize the Anthropic chat model
if not anthropic_api_key:
    raise ValueError("ANTHROPIC_API_KEY not found in environment variables or .env file")

model = ChatAnthropic(
    model_name="claude-3-5-sonnet-20240620",
    anthropic_api_key=anthropic_api_key,
    temperature=0.7,
    max_tokens=4000
)

# Initialize Wikipedia API wrapper
wikipedia = WikipediaAPIWrapper(top_k_results=2)

# Check if Gemini API is available
use_gemini = False
if google_api_key:
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        gemini_model = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=google_api_key)
        use_gemini = True
    except (ImportError, Exception) as e:
        print(f"Failed to initialize Gemini: {e}")
        print("Will use Claude for classification instead.")

# Prompt templates
STORYBOARD_PROMPT_TEMPLATE = PromptTemplate(
    input_variables=["audience", "topic", "wikipedia_info"],
    template="""For an audience of a {audience}, generate a series of 5 frames to explain {topic}. Each frame should be a single animation point, such as visualizing squaring a number visually or adding a vector tip to tail. It should not take longer than 15 seconds.
    Also use this wikipedia information to help create the frames {wikipedia_info}, but it is not necessary only for reference.

For example, explaining vector addition would be:
1. Frame showing 2 vectors from the origin explaining that these can be any arbitrary vector.
2. Moving the second vector to the tip of the first vector and draw a resulting vector.
3. Showing vector addition numerically, adding each component numerically.
4. Explain a simple practical example of vector addition, how 2 forces can combine together into a larger force.
5. Example question with answer.

Do not include a frame for a quiz.

Each frame should come with a short description of what it will talk about. This is meant to be the storyboard for an animated video explaining this concept.

Format the frames in the following JSON format:

{{ "frames": 
[
{{
"title": "xxxx",
"description": "xxxx"
}},
{{
"title": "xxxx",
"description": "xxxx"
}},
{{
"title": "xxxx",
"description": "xxxx"
}},
{{
"title": "xxxx",
"description": "xxxx"
}},
{{
"title": "xxxx",
"description": "xxxx"
}}
]
}}

Ensure that the JSON is valid.

The title should be short, limit of 5 words.
The description should be a few sentences, enough for someone to understand what to do and how to animate and explain this frame.

Output only the plaintext JSON format of the frames. DO NOT OUTPUT MARKDOWN. DO NOT INCLUDE A PREAMBLE OR POSTAMBLE."""
)

SCENE_AGENT_PROMPT_TEMPLATE = PromptTemplate(
    input_variables=["frame"],
    template="""Given the following, generate a script and animation description in the style of 3Blue1Brown.

{frame}

The script will be read orally to the student. This should not take longer than 10-15 seconds.
The animation description should be descriptive of what should be shown on the screen along with relevant positional information. (e.g., The number line should be centered vertically on the screen with a range of -10 to 10 with ticks for every 0.2, there is a blue arrow above the number line pointing from 0 to +5. The arrow will then shrink until it points to +2.)

In addition, generate a 4-choice multiple-choice question and a free-response question that can be asked at the end of the video.

The correct answer for the multiple-choice should always be the first in the array. The answer for the free response should be a string.

Return the data in the following format:

{{
"narration": "string",
"animation-description": "string",
"free-response-question": "string",
"free-response-answer": "string",
"multiple-choice-question": "string",
"multiple-choice-choices": ["answer - string", "wrong - string", "wrong - string", "wrong - string"]
}}

THE RESPONSE SHOULD ONLY BE A VALID PLAINTEXT JSON FORMAT. DO NOT OUTPUT MARKDOWN. DO NOT INCLUDE A PREAMBLE OR POSTAMBLE."""
)

EXAMPLE_CODE = r'''
from manim import *

class IntroductionToVector(Scene):
    def construct(self):
        # Axes
        axes = Axes(
            x_range=[-5, 5, 1], y_range=[-3, 3, 1],
            axis_config={"color": BLUE}
        )
        
        # Vector definition
        vector = Arrow(ORIGIN, [2, 1, 0], buff=0, color=YELLOW)
        vector_label = MathTex(r"\vec{{v}} = (2,1)").next_to(vector, UP)
        
        # Components
        x_component = DashedLine(start=ORIGIN, end=[2, 0, 0], color=RED)
        y_component = DashedLine(start=[2, 0, 0], end=[2, 1, 0], color=GREEN)
        
        x_label = MathTex("2").next_to(x_component, DOWN)
        y_label = MathTex("1").next_to(y_component, RIGHT)
        
        # Display the elements
        self.play(Create(axes))
        self.play(GrowArrow(vector), Write(vector_label))
        self.play(Create(x_component), Write(x_label))
        self.play(Create(y_component), Write(y_label))
        
        self.wait(2)
        
        # Vector Addition
        vector2 = Arrow([2, 1, 0], [4, 3, 0], buff=0, color=ORANGE)
        vector2_label = MathTex(r"\vec{{w}} = (2,2)").next_to(vector2, UP)
        
        result_vector = Arrow(ORIGIN, [4, 3, 0], buff=0, color=PURPLE)
        result_label = MathTex(r"\vec{{v}} + \vec{{w}} = (4,3)").next_to(result_vector, UP)
        
        self.play(GrowArrow(vector2), Write(vector2_label))
        self.wait(1)
        self.play(GrowArrow(result_vector), Write(result_label))
        
        self.wait(2)
'''

# Helper functions
def generate_response(prompt):
    """Extract JSON from Claude's response"""
    message = model.invoke(prompt)
    text = message.content
    json_match = re.search(r"\{.*\}", text, re.DOTALL)
    if json_match:
        return json_match.group(0)
    else:
        return ""

def generate_response_raw(prompt):
    """Get raw text response from Claude"""
    message = model.invoke(prompt)
    return message.content.strip()

def classify_input(user_input):
    """Classifies user input into topic and audience using Gemini if available, otherwise uses Claude."""
    if use_gemini:
        try:
            prompt = f"""Classify the following input into a topic and audience. If no audience is provided, default to college student.
            Return the response as a JSON object with "topic" and "audience" as keys.

            Input: {user_input}
            Output:
            """
            response = gemini_model.invoke(prompt)
            result = json.loads(response.content)
            return result
        except Exception as e:
            print(f"Error using Gemini for classification: {e}")
            # Fall back to Claude if Gemini fails
    
    # Use Claude for classification if Gemini is not available or failed
    prompt = f"""Classify the following input into a topic to explain and an audience level. If no audience level is explicitly mentioned, default to "college student".

    Input: "{user_input}"

    Return ONLY a JSON object with "topic" and "audience" as keys. For example:
    {{
        "topic": "quantum physics",
        "audience": "high school students"
    }}
    """
    
    try:
        response = model.invoke(prompt)
        text = response.content
        json_match = re.search(r"\{.*\}", text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group(0))
            return result
        else:
            # If no JSON is found, make a simple guess
            return {"topic": user_input, "audience": "college student"}
    except Exception as e:
        print(f"Error classifying input: {e}")
        return {"topic": user_input, "audience": "college student"}

def create_storyboard(audience, topic):
    """Generate a storyboard of frames to explain the topic"""
    wikipedia_info = wikipedia.run(topic)
    prompt = STORYBOARD_PROMPT_TEMPLATE.format(audience=audience, topic=topic, wikipedia_info=wikipedia_info)
    storyboard_json = generate_response(prompt)
    try:
        return json.loads(storyboard_json)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        print(f"Received JSON: {storyboard_json}")
        return None

def generate_scene(frame):
    """Generate a scene description from a frame"""
    prompt = SCENE_AGENT_PROMPT_TEMPLATE.format(frame=frame)
    scene_json = generate_response(prompt)
    try:
        return json.loads(scene_json)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        print(f"Received JSON: {scene_json}")
        return None

def generate_animation_code(narration, animation_description, title, scene_number=None):
    """Generate Manim animation code for a scene"""
    # Use a numbered scene class name if provided, otherwise sanitize the title
    if scene_number:
        scene_class_name = f"Scene{scene_number}"
    else:
        scene_class_name = ''.join(c for c in title if c.isalnum())
        if not scene_class_name:
            scene_class_name = "AnimationScene"
    
    prompt = f"""
1. Given the scene description and title, write COMPLETE, READY-TO-RUN,JUST Manim code for this scene in 3Blue1Brown style. This scene should be between 5 and 10 seconds. This scene should contain and render a short text blurb describing the scene.
2. Include ALL necessary imports at the beginning of the code, including Manim and NumPy.
3. Define a complete Manim Scene class. The name of the class should be "{scene_class_name}" (NOT "Scene" as this would shadow the base Scene class).
4. Make sure that any LaTeX equations are rendered correctly.
5. Ensure that the font_size is small (< 23pt).
6. Ensure no Manim objects have the same y-coordinate to prevent overlapping.
7. Ensure any text, diagrams, or formulas fit fully on the screen. Adjust sizes as necessary.
8. Text should be concise and to the point, no more than 10 words.
9. Ensure that the mathematics is consistent with the narration.
10. Ensure that all visualizations are coherent and have a mathematical basis.
11. Write the entire code in one chunk at every code generation stage.
12. Use default Manim colors and styles. 
13. DO NOT INCLUDE ANY OUTSIDE GRAPHICS OR IMAGES. ONLY USE MANIM.
14. Only include the COMPLETE Manim code for the scene. DO NOT INCLUDE A PREAMBLE OR POSTAMBLE.
15. If the description is vague, create a scene that is related to the title.
16. Every scene must have an animation. Also if you add topic name/headline, ALWAYS ADD IT TO THE BOTTOM OF THE ANIMATION.
17.There should be just manim code with the necessary import and class definition. no other comment or text like ```python
18. ALWAYS USE 2 AXIS DIAGRAMS AND CHECK FOR THIS ERROR - got an unexpected keyword argument 'scale_tips'
Here is an example manim code:

{EXAMPLE_CODE}

Narration: 
{narration}

Animation Description:
{animation_description}

Title:
{title}

ONLY RETURN THE COMPLETE MANIM CODE FOR THE SCENE. DO NOT INCLUDE A PREAMBLE OR POSTAMBLE.
"""
    response = generate_response_raw(prompt)
    if not response:
        response = f"""from manim import *
class {scene_class_name}(Scene):
    def construct(self):
        text = Text("No animation generated", font_size=48)
        self.play(Write(text))
        self.wait(1)
        """

    # Add a comment at the top with instructions for running the animation
    run_instructions = """# To run this animation, use the following command:
# manim -pql <filename>.py {0}
# or for higher quality:
# manim -pqh <filename>.py {0}
""".format(scene_class_name)

    return run_instructions + response

def generate_educational_content(user_input):
    """Generate complete educational content from a user input"""
    # Step 1: Classify input
    classification = classify_input(user_input)
    audience = classification.get("audience", "college student")
    topic = classification.get("topic", user_input)
    
    # Step 2: Create storyboard
    storyboard = create_storyboard(audience, topic)
    result = {
        "metadata": {
            "topic": topic,
            "audience": audience
        },
        "success": False,
        "scenes": []
    }
    
    # Step 3: Generate scenes
    if storyboard and "frames" in storyboard:
        result["success"] = True
        
        for i, frame in enumerate(storyboard["frames"]):
            if i >= 5:
                break
            
            scene_number = i + 1
            scene_data = {
                "scene_number": scene_number,
                "title": frame["title"],
                "description": frame["description"]
            }
            
            scene = generate_scene(frame["description"])
            if scene:
                # Add scene details
                if "narration" in scene:
                    scene_data["narration"] = scene["narration"]
                if "animation-description" in scene:
                    scene_data["animation_description"] = scene["animation-description"]
                
                # Generate assessment
                scene_data["assessment"] = {
                    "multiple_choice": {
                        "question": scene.get("multiple-choice-question", ""),
                        "choices": scene.get("multiple-choice-choices", [])
                    },
                    "free_response": {
                        "question": scene.get("free-response-question", ""),
                        "answer": scene.get("free-response-answer", "")
                    }
                }
                
                # Generate animation code
                scene_data["manim_code"] = generate_animation_code(
                    scene.get("narration", ""), 
                    scene.get("animation-description", ""), 
                    frame["title"],
                    scene_number
                )
            
            result["scenes"].append(scene_data)
    
    return result

# FastAPI application
app = FastAPI()

class Item(BaseModel):
    prompt: str

@app.post("/process-data")
async def index(item: Item):
    """API endpoint to generate educational content"""
    try:
        # Generate educational content from the prompt
        result = generate_educational_content(item.prompt)
        print(result)
        # Return the result as JSON
        return {
            "status": "success",
            "data": result,
            "message": "Educational content generated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": str(e),
                "data": None
            }
        )
