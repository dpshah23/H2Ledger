import json
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from h2ledger.settings import GEMINI_API_KEY
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes

# Your local knowledge base
KNOWLEDGE_BASE = {
    "project_overview": {
        "name": "Hydrogen Credit Trading Platform",
        "theme": "Green Hydrogen Fuel & Blue Carbon Ecosystem",
        "description": "A blockchain-based platform where producers, buyers, and verifiers can trade and validate hydrogen credits in a transparent, tamper-proof manner."
    },
    "roles": {
        "producer": "Can generate (mint) new hydrogen credits, transfer them, or use them. Producers can also act as buyers when needed.",
        "buyer": "Can purchase hydrogen credits from producers or other buyers. Buyers can also transfer credits to others.",
        "verifier": "A trusted authority that verifies the authenticity of hydrogen credit batches before they can be traded."
    },
    "authentication": {
        "method": "Users authenticate via wallet address (Metamask).",
        "note": "No private keys are stored in the backend. Signing of transactions always happens locally in the user's wallet."
    },
    "api_endpoints": {
        "auth": {
            "signup": "POST /auth/signup/ - Register a new user with wallet address and role.",
            "login": "POST /auth/login/ - Authenticate user by wallet address and return token."
        },
        "credits": {
            "mint": "POST /api/mint/ - Producers mint new credits (requires verifier approval).",
            "transfer": "POST /api/transfer/ - Transfer credits between wallets.",
            "use": "POST /api/use/ - Mark credits as used (retired).",
            "batch_verification": "POST /api/batch/ - Verifier validates a batch of credits."
        },
        "dashboard": {
            "view": "GET /api/dashboard/ - Fetch user-specific information like balance, transfers, and history."
        }
    },
    "ai_chatbot": {
        "integration": "Gemini API",
        "purpose": "Acts as a knowledge assistant for the hackathon project.",
        "capabilities": [
            "Answer user queries about platform workflow, endpoints, and roles.",
            "Provide guidance on how to mint, transfer, or use credits (conceptual explanation).",
            "Retrieve and explain data from the dashboard or API endpoints.",
            "Explain project theme and hackathon-specific context."
        ],
        "limitations": [
            "Does not execute blockchain transactions.",
            "Does not access or require private keys.",
            "Does not replace Metamask or wallet signing process.",
            "Only works with knowledge base and public API responses."
        ],
        "sample_prompts": [
            "Explain how producers mint credits.",
            "How does verification of batches work?",
            "What can buyers and producers both do?",
            "Show me my credit balance from the dashboard API."
        ]
    }
}


@csrf_exempt
@permission_classes([AllowAny])
def chatbot_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        body = json.loads(request.body.decode("utf-8"))
        user_question = body.get("question")

        if not user_question:
            return JsonResponse({"error": "Missing 'question' field"}, status=400)

        # Build prompt
        prompt = (
            "You are an assistant for a Hackathon project. "
            "Use the following knowledge base to answer clearly and factually. "
            "If question is outside scope, say you don’t know.\n\n"
            f"Knowledge Base:\n{json.dumps(KNOWLEDGE_BASE, indent=2)}\n\n"
            f"User Question: {user_question}"
        )

        print("Gemini Key:", GEMINI_API_KEY)


        # Gemini endpoint (API key in header)
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": "AIzaSyCihZkP5WL4aO0HmhBn-gf89xmyahMyFb4"
        }

        payload = {
            "contents": [
                {"parts": [{"text": prompt}]}
            ]
        }

        response = requests.post(url, headers=headers, json=payload)

        if response.status_code != 200:
            return JsonResponse(
                {"error": "Gemini API request failed", "details": response.json()},
                status=response.status_code
            )

        result = response.json()
        ai_answer = (
            result.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "⚠️ No response generated")
        )
        result = response.json()
        try:
            ai_answer = result["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            ai_answer = "Sorry, I couldn’t understand Gemini’s response."

        return JsonResponse({"answer": ai_answer})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
