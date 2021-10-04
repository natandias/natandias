const { parse } = require("rss-to-json");
const fs = require("fs");

const RSS_URL = `https://natandias.github.io/myblog/rss.xml`;

const formatToDate = date => {
  const stringifyedDate = new Date(date).toISOString().split("T")[0];
  const formattedToBrazil = stringifyedDate
    .split("-")
    .reverse()
    .join("-")
    .toString();
  return formattedToBrazil;
};

const getPosts = () => {
  parse(RSS_URL).then(rss => {
    const orderedByDatePosts = rss.items.sort(item => (item.created > item.created) ? 1 : -1)

    const mappedRssPosts = orderedByDatePosts.map(item => ({
      title: item.title,
      link: item.link,
      description: item.description,
      createdAt: formatToDate(item.created),
    }));

    writeOnReadme(JSON.stringify(mappedRssPosts));
  });
};

const formatPosts = posts => {
  let formattedPosts = `
  <table>
    <tr>
      <th>Article</th>
      <th>Description</th>
      <th>Posted at</th>
    </tr>`;

  const parsedPosts = JSON.parse(posts);

  for (const post of parsedPosts) {
    formattedPosts += `
    <tr>
      <td>
        <a href="${post.link}" alt="${post.title}" target="_blank" rel="noreferrer noopen">
          ${post.title}
        </a>
      </td>
      <td>${post.description.substring(0, 40) + "..."}</td>
      <td>${post.createdAt}</td>
    </tr>`;
  }

  formattedPosts += `</table>`;

  return formattedPosts;
};

const writeOnReadme = posts => {
  const readme = fs.readFileSync("./README.md", "utf8");

  const startWritingPosition = readme.indexOf("<!--START-BLOG-POSTS-->") + 23;
  const endingWritingPosition = readme.indexOf("<!--END-BLOG-POSTS-->");

  const formattedPosts = formatPosts(posts);

  const readmeWithoutOldPosts =
    readme.substring(0, startWritingPosition) +
    readme.substring(endingWritingPosition);

  const editedReadme = readmeWithoutOldPosts.substring(0, startWritingPosition) +
    formattedPosts + '\n' +
    readmeWithoutOldPosts.substring(startWritingPosition);

  const openedFile = fs.openSync("./README.md", "w");
  fs.writeSync(openedFile, editedReadme);
  fs.closeSync(openedFile);
};

getPosts();
