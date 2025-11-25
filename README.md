<<<<<<< HEAD
# Voting Poll Website

A modern voting poll website for Ward No. 8 - B, displaying candidates for the position of Nagar Sevak .
## Features

- **Modern UI**: Dark theme with glassmorphism effects, smooth animations, and responsive design
- **Voting System**: One vote per IP address 
- **Real-time Results**: Interactive pie charts and progress bars with vote percentages
- **Social Sharing**: Share results on WhatsApp, Telegram, Instagram, and Facebook
- **Mobile Responsive**: Optimized for all device sizes with touch-friendly interface
- **Accessibility**: Large buttons, readable fonts, and proper contrast ratios

## Technology Stack

- **Backend**: Django 4.2+ with Django REST Framework
- **Database**: PostgreSQL (production) / SQLite (development)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Tailwind CSS
- **Charts**: Chart.js for data visualization
- **Styling**: Glassmorphism effects with gradient backgrounds






## Installation & Setup

### Prerequisites
- Python 3.8+
- pip package manager
- PostgreSQL (for production)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voting_poll
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Populate candidates data**
   ```bash
   python manage.py populate_candidates
   ```

7. **Start development server**
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

8. **Access the application**
   Open your browser and go to `http://localhost:8000`

### Production Setup

1. **PostgreSQL Setup**
   ```bash
   # Create database
   createdb voting_poll
   
   # Create user
   createuser -P voting_poll_user
   ```

2. **Update Django settings**
   Modify `voting_poll/settings.py` to use PostgreSQL:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'voting_poll',
           'USER': 'voting_poll_user',
           'PASSWORD': 'your_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

3. **Static files collection**
   ```bash
   python manage.py collectstatic
   ```

4. **Environment variables**
   Set the following environment variables:
   ```bash
   export DEBUG=False
   export SECRET_KEY=your-secret-key
   export DB_NAME=voting_poll
   export DB_USER=voting_poll_user
   export DB_PASSWORD=your-password
   export DB_HOST=localhost
   export DB_PORT=5432
   ```

## API Endpoints

### POST /api/vote/
Cast a vote for a candidate.

**Request Body:**
```json
{
    "candidate_id": 1
}
```

**Response Success:**
```json
{
    "success": true,
    "message": "Vote recorded successfully"
}
```

**Response Error:**
```json
{
    "success": false,
    "error": "You already voted on this poll"
}
```

### GET /api/results/
Get voting results with percentages and total votes.

**Response:**
```json
{
    "success": true,
    "total_votes": 150,
    "candidates": [
        {
            "id": 1,
            "name": "ॲड. शोएब शेख",
            "party": "राष्ट्रवादी काँग्रेस पार्टी",
            "votes": 75,
            "percentage": 50.0,
            "actual_votes": 25,
            "boosted_votes": 50
        }
    ]
}
```

### GET /api/candidates/
Get all candidates for display.

**Response:**
```json
{
    "success": true,
    "candidates": [
        {
            "id": 1,
            "name": "ॲड. शोएब शेख",
            "party": "राष्ट्रवादी काँग्रेस पार्टी",
            "display_order": 1
        }
    ]
}
```

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/` to manage candidates and view voting data.

**Default admin credentials:**
- Create superuser: `python manage.py createsuperuser`

## Security Features

- **IP-based voting restriction**: One vote per IP address
- **Database transactions**: Prevents race conditions in vote counting
- **Input validation**: Sanitizes and validates all user inputs
- **CORS configuration**: Properly configured for cross-origin requests

## UI/UX Features

- **Glassmorphism Design**: Transparent cards with backdrop blur effects
- **Gradient Backgrounds**: Beautiful color transitions
- **Smooth Animations**: Hover effects and transitions
- **Mobile First**: Responsive design for all screen sizes
- **Accessibility**: Large touch targets, readable fonts, proper contrast
- **Toast Notifications**: User-friendly error and success messages
- **Modal Popups**: Animated share modal with social media options

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Optimizations

- **Vote Count Cache**: Pre-calculated vote counts for faster results
- **Database Indexing**: Optimized queries for better performance
- **Static File Caching**: Proper cache headers for static assets
- **Chart.js Optimization**: Efficient chart rendering

## Deployment Options

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Heroku
1. Create a Heroku app
2. Add PostgreSQL addon
3. Configure environment variables
4. Deploy using Git

### Digital Ocean
1. Create a Droplet
2. Install PostgreSQL and Python
3. Clone repository and setup application
4. Configure Nginx as reverse proxy

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check PostgreSQL service status
   - Verify database credentials
   - Ensure database exists

2. **Static files not loading**
   - Run `python manage.py collectstatic`
   - Check STATIC_URL and STATIC_ROOT settings
   - Verify web server configuration

3. **CORS errors**
   - Check CORS_ALLOWED_ORIGINS setting
   - Ensure proper domain configuration
   - Verify CORS middleware is enabled

4. **Voting not working**
   - Check IP address detection
   - Verify database connectivity
   - Check browser console for errors

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is a demonstration project. For production use, ensure proper security measures, database backups, and monitoring are in place.
=======
# voting_poll
voting poll 
>>>>>>> a7889343823a670ed17d6af1b86fb7aa8e73a881
