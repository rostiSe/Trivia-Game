export async function fetchTriviaQuestions () {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trivia/questions`)
        const data = await response.json()
        return data     
    } catch (error) {
        console.error(error)
    }
}

export async function saveQuestion (question:{question: string, correct_answer: string, incorrect_answers: string[], category: string, difficulty: string}) {
    try {
        const response = await fetch('http://localhost:3001/api/questions/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(question)
        })
        const data = await response.json()
        return data
    } catch (error) {
        console.error(error)
    }
}