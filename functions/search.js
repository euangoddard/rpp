const lunr = require("lunr");
const { index: indexData, metadata } = require("./search-index.json");
const idx = lunr.Index.load(indexData);

exports.handler = async (event) => {
  const query = event.queryStringParameters.q;
  let results = [];
  if (query?.trim()) {
    const startsWithQuery = query.split(" ", 1)[0] + "*";
    try {
      results = idx.search(`${query} ${startsWithQuery}`);
    } catch (error) {
      if (error instanceof QueryParseError) {
        results = [];
      } else {
        throw error;
      }
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      results: results.map(({ ref, score }) => ({
        url: `/recipes/${ref}`,
        title: metadata[ref],
        score,
      })),
    }),
  };
};
