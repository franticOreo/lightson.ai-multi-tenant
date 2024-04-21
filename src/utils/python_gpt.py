def understand_image(image_url, ai_client, prompt="What's in this image?"):
  response = ai_client.chat.completions.create(
    model="gpt-4-vision-preview",
    messages=[
      {
        "role": "user",
        "content": [
          {"type": "text", "text": prompt},
          {
            "type": "image_url",
            "image_url": {
              "url": image_url,
            },
          },
        ],
      }
    ],
    max_tokens=300,
  )

  return response.choices[0].message.content


instagram_profile_understanding = understand_image(screenshot_cdn_url, ai_client)

bio_language_kw_prompt = f"""Read this page description: {instagram_profile_understanding}
      and create a three fields:
      - `business_bio` : 2-3 sentances. 
      - `language_style`
      - `SEO_keywords`: using local area {CLIENT_SERVICE_AREA}"""

def profile_to_bio_language_kw(bio_language_kw_prompt, ai_client):
    max_retries = 3
    retry_count = 0

    while retry_count < max_retries:
        response = ai_client.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "You are a helpful assistant designed to output JSON."},
                {"role": "user", "content": bio_language_kw_prompt}
            ]
        )
        profile_bio_language_kw = response.choices[0].message.content
        profile_bio_language_kw = json.loads(profile_bio_language_kw)

        if all(key in profile_bio_language_kw for key in ['business_bio', 'language_style', 'SEO_keywords']):
                break  # Exit the loop if all required keys are present

        retry_count += 1

        if retry_count == max_retries:
            print("Failed to obtain all required keys after 3 retries.")
        else:
            print("Blog object contains all required keys.")
  
    return profile_bio_language_kw 

bio_language_kw_obj = profile_to_bio_language_kw(bio_language_kw_prompt, ai_client)

CLIENT_BUSINESS_BIO = bio_language_kw_obj['business_bio']
CLIENT_LANGUAGE_STYLE = bio_language_kw_obj['language_style']
CLIENT_KEYWORDS = bio_language_kw_obj['SEO_keywords']



BLOG_PROMPT = f"""Business: {CLIENT_BUSINESS_PURPOSE}

Language: {CLIENT_LANGUAGE_STYLE}

Caption: {post['caption']}

Image Post Description: {image_understanding}

Location: {CLIENT_SERVICE_AREA}

Target Keyword: {CLIENT_KEYWORDS}

Using the information from the Instagram post above, create a short blog post that incorporates the caption, image description, and location to optimize it for local SEO. The blog post should be informative, engaging, and relevant to the target keyword while naturally incorporating it throughout the content.

Return the following four elements:

`title`: A catchy headline that includes the target keyword 

`content`: An introduction that grabs the reader's attention and sets the context
Body paragraphs that expand on the topic, providing valuable information and naturally integrating the target keyword, location, and relevant details from the Instagram post
A conclusion that summarizes the main points and includes a call-to-action

`excerpt`: A concise summary of the blog post (up to 160 characters) that includes the target keyword and entices users to click through from search engine results
Ensure the blog post is well-written, informative, and optimized for both readability and search engines. Use short paragraphs, subheadings, and bullet points where appropriate to enhance readability.

`slug`: A slug for the post.
"""

def create_blog_fields(BLOG_PROMPT, ai_client):
    max_retries = 3
    retry_count = 0

    while retry_count < max_retries:
        response = ai_client.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "You are a helpful assistant designed to output JSON."},
                {"role": "user", "content": BLOG_PROMPT}
            ]
        )
        blog_fields = response.choices[0].message.content
        blog_fields = json.loads(blog_fields)

        if all(key in blog_fields for key in ['title', 'content', 'excerpt', 'slug']):
            break  # Exit the loop if all required keys are present

        retry_count += 1

    if retry_count == max_retries:
        print("Failed to obtain all required keys after 3 retries.")
    else:
        print("Blog object contains all required keys.")
  
    return blog_fields  

def make_blog_prompt(post_caption, image_understanding):
    return f"""Business Bio: {CLIENT_BUSINESS_BIO}

    Language: {CLIENT_LANGUAGE_STYLE}

    Caption: {post_caption}

    Image Post Description: {image_understanding}

    Location: {CLIENT_SERVICE_AREA}

    Target Keyword: {CLIENT_KEYWORDS}

    Using the information from the Instagram post above, create a short blog post that incorporates the caption, image description, and location to optimize it for local SEO. The blog post should be informative, engaging, and relevant to the target keyword while naturally incorporating it throughout the content.

    Return the following four elements:

    `title`: A catchy headline that includes the target keyword 

    `content`: An introduction that grabs the reader's attention and sets the context
    Body paragraphs that expand on the topic, providing valuable information and naturally integrating the target keyword, location, and relevant details from the Instagram post
    A conclusion that summarizes the main points and includes a call-to-action

    `excerpt`: A concise summary of the blog post (up to 160 characters) that includes the target keyword and entices users to click through from search engine results
    Ensure the blog post is well-written, informative, and optimized for both readability and search engines. Use short paragraphs, subheadings, and bullet points where appropriate to enhance readability.

    `slug`: A slug for the post.
    """