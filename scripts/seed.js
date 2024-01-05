import { Movie, Rating, User, db } from '../src/model.js';
import movieData from './data/movies.json' assert { type: 'json' };
import lodash from "lodash";

console.log('Syncing database...');
await db.sync({ force: true });

console.log('Seeding database...');

const moviesInDB = await Promise.all (
    movieData.map(async (movie) => {
        const releaseDate = new Date(Date.parse(movie.releaseDate));
        
        const { title, overview, posterPath } = movie;

        const newMovie = await Movie.create({
            title,
            overview,
            posterPath,
            releaseDate,
        });

        return newMovie;

    }),
);

// call user seed here
const usersToCreate = [];
for(let i=1; i <= 10; i++){
    usersToCreate.push(
        {
            email: `user${i}@test.com`,
            password: "test",
        }
    )
}
const usersInDB = await Promise.all (
    usersToCreate.map(async (user) => {
        return await User.create({...user})
    })
);

const ratingsInDB = await Promise.all(
    usersInDB.flatMap((user) => {
      const randomMovies = lodash.sampleSize(moviesInDB, 10);
      const movieRatings = randomMovies.map(async (movie) => {
        return await  Rating.create({
          score: lodash.random(1,5),
          userId: user.userId,
          movieId: movie.movieId
        });
      });
      return movieRatings;
    })
  );

await db.close();
console.log('Finished seeding database!');