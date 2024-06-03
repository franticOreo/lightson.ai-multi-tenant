import React from "react";
import { Gutter } from "../app/_components/Gutter";
import { Button } from "../app/_components/Button";
const TestGetPost: React.FC = () => {
	// test with user api-key (admin@abc.com) - ABC tenant
	const apiKey = "073694fe-817c-44ae-b5cd-bcfb831dc60a";
    const handleClick = async () => {
      const response = await fetch('/api/posts', {
		method: "GET",
		credentials: 'include', // Ensure cookies are included
		headers: {
		  "Authorization": `users API-Key ${apiKey}`
		},
	  }).then((response) => {
		if (!response.ok) {
		  console.error(`HTTP error, status = ${response.status}`);
		}
		return response.json().then(json => {
		  console.log(json); // Log the full JSON response
		  return json; // Return the JSON data for further processing
		}).catch(err => {
		  console.error("Error parsing JSON:", err);
		});
	  }).catch(err => {
		console.error("Network or fetch error:", err);
	  });
    };
	return (
		<Gutter>
			<div className="card ">
				<div className="form-container">
					<Button
						type="button"
						label="Get posts"
						onClick={handleClick}
						appearance="primary"
						className="button mt-40"
					/>
				</div>
			</div>
		</Gutter>
	);
};

export default TestGetPost;
