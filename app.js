import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import ViteExpress from 'vite-express';
import { Movie, Rating, User } from './src/model.js';

const app = express();
const port = '8000';
ViteExpress.config({ printViteDevServerHost: true });

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: false }));

function loginRequired(req,res, next) {
    if (!req.session.userId) {
        res.status(401).json({ error: 'Unauthorized' });
    } else {
        next();
    }
};

app.get('/api/movies', async (req, res) => {
    const fullMovieList = await Movie.findAll();
    res.json(fullMovieList);
});

app.get('/api/movies/:movieId', async (req, res) => {
    const movieId = req.params.movieId;
    const movieDetails = await Movie.findOne({
        where: { movieId },
        include: Rating
        }); 
    // const movieDetails = await Movie.findByPk(movieId); 
    //     ,{
    //     include: [
    //         {
    //             score: 
    //         }
    //     ]
    // });
    //plus array of user ratings for this movie
    // const movieRatings = await Rating.findAll({
    //     where: { movieId: {[Op.eq]: movieId} },
    //     attributes: ['score']
    // })
    // const movieRatings = await movieDetails.getRatings('score');
    // scores = movieRatings.getDataValue('score');
    // console.log("mrat: " + movieRatings);
    res.json(movieDetails);
});

app.post('/api/auth', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });
  
    if (user && user.password === password) {
      req.session.userId = user.userId;
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
});

app.post('/api/logout', loginRequired, (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/ratings', loginRequired, async (req, res) => {
    const { userId } = req.session;
    const user = await User.findByPk(userId);
    const ratings = await user.getRatings({
        include: {
          model: Movie,
          attributes: ['title'],
        },
    });
    res.json(ratings);
});

app.post('/api/ratings', loginRequired, async (req, res) => {
    const { userId } = req.session;
    const { movieId, score } = req.body;
    const user = await User.findByPk(userId);
    const rating = await user.createRating({ movieId: movieId, score: score });
    res.json(rating);
});



ViteExpress.listen(app, port, () => console.log(`Server is listening on http://localhost:${port}`));
