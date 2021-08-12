const express = require("express");
const app = express();

//Obtain the flip-records from the data directory
const flips = require("./data/flips-data");
const counts = require("./data/counts-data");

/******************************** ROUTES ********************************/
app.use(express.json());

/************** /flips/ paths **************/
//Keeps track of largest currently existing ID to prevent collisions
let lastFlipId = flips.reduce((maxId, flip) => Math.max(maxId, flip.id), 0);

// Validation Middleware
function bodyHasResultProperty(req, res, next) {
  const { data: { result } = {} } = req.body;
  if (result) {
    return next(); // Call `next()` without an error message if the result exists
  }
  return next({
    status: 400,
    message: "A 'result' property is required.",
  });
}

// "/flips/:flipId" Route
app.get("/flips/:flipId", (req, res, next) => {
  const { flipId } = req.params;
  const foundFlip = flips.find((flip) => flip.id === Number(flipId));

  return foundFlip
    ? res.json({ data: foundFlip })
    : next(`Flip id "${flipId}" not found!`);
});

// "/flips" Route
app.get("/flips", (req, res) => res.json({ data: flips }));

app.post(
  "/flips",
  bodyHasResultProperty, // Add validation middleware function
  (req, res) => {
    // Route handler no longer has validation code.
    const { data: { result } = {} } = req.body;
    const newFlip = {
      id: ++lastFlipId, // Increment last id then assign as the current ID
      result: result,
    };
    flips.push(newFlip);
    res.status(201).json({ data: newFlip });
  }
);

/************** /coins/ paths **************/
// "/counts/:countId" Route
app.get("/counts/:countId", (request, response, next) => {
  const { countId } = request.params;
  const foundCount = counts[countId];

  return foundCount === undefined
    ? next({
        status: 404,
        message: `Count id "${countId}" not found!`,
      })
    : response.json({ data: foundCount });
});

// "/counts" Route
app.get("/counts", (req, res) => {
  res.json({ data: counts });
});

// Default 404 Route
app.use((request, response, next) => {
  next(`Not found: ${request.originalUrl}`);
});

// Error handler
app.use((error, request, response, next) => {
  console.error(error);
  const { status = 500, message = `Something went wrong!` } = error;
  response.status(status).json({ error: message });
});

module.exports = app;
