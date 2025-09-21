import {endPoint, apiKey} from '../../../Authentication';

export async function getAiResponse(messages) {
    const response = await fetch(`${endPoint}/chat/completions?api-version=2025-01-01-preview`, {  
        method: 'POST',  
        headers: {  
            'Content-Type': 'application/json',  
            'Authorization': `Bearer ${apiKey}`  
        },  
        body: JSON.stringify({  
            "messages": messages,  
            "max_tokens": 4096,  
            "temperature": 1,  
            "top_p": 1,  
            "model": "gpt-4o"  
        })  
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log("API Response:", data);  
    
    // Extract JSON from response
    const responseContent = data.choices[0].message.content;
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
        throw new Error('No JSON found in response');
    }
    
    return jsonMatch[0];
}