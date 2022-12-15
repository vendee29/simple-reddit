export function fetchWithUsername(url, method, values) { // sends request when a username is available
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'username': localStorage.getItem('username')
        },
        body: JSON.stringify(values)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        window.location.href = 'http://localhost:3000/main';
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

export function fetchWithoutUsername(url, method, values) { // sends request when no username is available
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        window.location.href = 'http://localhost:3000/main';
    })
    .catch(error => {
        console.error('Error:', error);
    });
}