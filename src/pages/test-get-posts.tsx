import React from "react";
import { Gutter } from "../app/_components/Gutter";
import { Button } from "../app/_components/Button";
const TestGetPost: React.FC = () => {
    const handleClick = async () => {
      const response = await fetch('/api/posts', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				console.error('Failed to fetch posts');
			}
			const data = await response.json();
			console.log("data: ", data);
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
