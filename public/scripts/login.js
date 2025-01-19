document
    .getElementById('loginForm')
    .addEventListener('submit', async function (e) {
        e.preventDefault()

        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        const errorMessage = document.getElementById('error-message')

        // Clear previous error messages
        errorMessage.textContent = ''

        try {
            const response = await fetch('/api/v1/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            if (response.ok) {
                const data = await response.json() // The token and user details are inside `data`
                console.log(data.token)
                // Store the JWT token in localStorage (or sessionStorage if you prefer)
                localStorage.setItem('authToken', data.token)

                // Optionally store user data (if returned)
                localStorage.setItem('user', JSON.stringify(data.user)) // Example: store the user object

                // Redirect to the home or dashboard page after login
                window.location.href = '/api/v1/' // Adjust the URL as needed
            } else {
                const error = await response.text()
                errorMessage.textContent = error // Show error message
            }
        } catch (error) {
            console.error('Error logging in:', error)
            errorMessage.textContent = 'Something went wrong. Please try again.'
        }
    })
