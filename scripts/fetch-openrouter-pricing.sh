#!/bin/bash
# Fetch current OpenRouter model pricing
# Usage: ./scripts/fetch-openrouter-pricing.sh [YOUR_OPENROUTER_API_KEY]

set -e

API_KEY="${1:-$OPENROUTER_API_KEY}"

if [ -z "$API_KEY" ]; then
    echo "Error: OpenRouter API key required"
    echo "Usage: $0 YOUR_API_KEY"
    echo "   or: OPENROUTER_API_KEY=xxx $0"
    exit 1
fi

echo "Fetching current OpenRouter pricing..."
echo ""

# Popular coding models
echo "=== Popular Coding Models ==="
echo ""

curl -s 'https://openrouter.ai/api/v1/models' \
    -H "Authorization: Bearer $API_KEY" \
    | jq -r '.data[] | 
        select(.id | test("claude-3.5-sonnet|gpt-4o|gemini-pro-1.5|kimi-k2.5|qwen")) | 
        "Model: \(.id)\n  Input: $\(.pricing.prompt) per token\n  Output: $\(.pricing.completion) per token\n  Context: \(.context_length) tokens\n  Per 1M tokens - Input: $\(((.pricing.prompt | tonumber) * 1000000) | tostring), Output: $\(((.pricing.completion | tonumber) * 1000000) | tostring)\n"'

echo ""
echo "=== Budget-Friendly Models ==="
echo ""

curl -s 'https://openrouter.ai/api/v1/models' \
    -H "Authorization: Bearer $API_KEY" \
    | jq -r '.data[] | 
        select((.pricing.prompt | tonumber) < 0.000001) | 
        select(.id | test("gpt|claude|gemini|kimi|qwen")) |
        "Model: \(.id)\n  Input: $\(.pricing.prompt) per token ($\(((.pricing.prompt | tonumber) * 1000000) | tostring) per 1M)\n  Output: $\(.pricing.completion) per token ($\(((.pricing.completion | tonumber) * 1000000) | tostring) per 1M)\n  Context: \(.context_length) tokens\n"' \
    | head -50

echo ""
echo "To see all models, run:"
echo "curl -s 'https://openrouter.ai/api/v1/models' -H 'Authorization: Bearer \$OPENROUTER_API_KEY' | jq '.data'"
echo ""
echo "API Documentation: https://openrouter.ai/docs/api/api-reference/models/get-models"
