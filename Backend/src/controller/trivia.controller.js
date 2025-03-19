// /controllers/triviaController.js
export const fetchTriviaQuestions = async (req, res) => {
    try {
      // 1) Parse query params
      const { amount = 5, category, difficulty, type } = req.query;
      // Default amount to 5 if not provided
  
      // 2) Build the OpenTDB URL
      // Base: https://opentdb.com/api.php
      let apiUrl = `https://opentdb.com/api.php?amount=${amount}`;
  
      if (category) apiUrl += `&category=${category}`;
      if (difficulty) apiUrl += `&difficulty=${difficulty}`;
      if (type) apiUrl += `&type=${type}`
  
      // 3) Fetch data
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.log(response);
        return res.status(500).json({ error: 'Failed to fetch from OpenTDB' });
      }
      const data = await response.json();
  
      // 4) Check the results
      if (data.response_code !== 0) {
        // A non-zero means no results or an error from OpenTDB
        return res.status(404).json({ error: 'No questions found' });
      }
  
      // 5) Return the fetched questions to the user
      return res.status(200).json(data.results);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  };

  export const fetchTriviaCategories = async (req, res) => {
        try {
            const response = await fetch('https://opentdb.com/api_category.php')
            if (!response.ok){
                return res.status(500).json({error:' Couldnt fetch Categories from OpenTDb'})
            }
            const data = await response.json()
            return res.status(200).json(data)
        } catch (error) {
            throw error
        }
  }
  