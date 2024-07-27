// Sequence Diagram for InstagramAPICallback Handling

title InstagramAPICallback Handling

// Actors
Client [icon: monitor]
Server [icon: server]
InstagramAPI [icon: cloud, color: blue]
PayloadCMS [icon: tool, color: orange]
Vercel [icon: cloud, color: purple]


// Start of the signup process
Client > Server: startSignUp(req, res)
activate Client

// Server creates a new user
Server > Server: createUser(email, password)
activate Server
Server > PayloadCMS: Insert user record
PayloadCMS --> Server: User created
deactivate Server

// Server logs in the user
Server > InstagramAPI: loginUser(email, password, true)
activate InstagramAPI
InstagramAPI--> Server: Session token
deactivate InstagramAPI

// Server creates a business entry
Server > Server: createBusinessEntry(businessDetails, payloadToken)
activate Server
Server > PayloadCMS: Insert business record
PayloadCMS --> Server: Business entry created
deactivate Server

// Server encodes the user ID
Server > Server: encodeURIComponent(JSON.stringify({ userId: userId }))
activate Server
Server --> Server: Encoded URI component
deactivate Server

// Server sends the InstagramAPIauthentication URL back to the client
Server > Client: res.json({ authUrl })
deactivate Client

// End of the process
Client --> Server: Acknowledgement


// Sequence of interactions
Client > Server: handleInstagramCallback(req, res)
activate Server

Server > Server: extractUserTokenFromState(state)
Server > InstagramAPI: fetch(tokenUrl, POST request configuration)
activate InstagramAPI
InstagramAPI --> Server: instagramAccessToken
deactivate InstagramAPI

Server > Server: getInstagramHandle(instagramAccessToken)
Server > PayloadCMS: : createInstagramProfileEntry({ payloadUserId, instagramUserId, instagramHandle, accessToken })
activate PayloadCMS
PayloadCMS --> Server: Profile entry created
deactivate PayloadCMS

Server > Client: res.redirect(/onboarding?userId=${payloadUserId})
deactivate Server

// Upload initial posts to Payload CMS
Client > PayloadCMS: uploadInitialPostsToPayload(payloadUserId, 4)
activate PayloadCMS

PayloadCMS > PayloadCMS: getInstagramProfileByUserId(payloadUserId)
PayloadCMS > PayloadCMS: getBusinessDetailsByUserId(payloadUserId)
PayloadCMS > PayloadCMS: handleTenantCreation(payloadUserId, instagramProfileData)
PayloadCMS > PayloadCMS: handleBusinessDetailsUpdate(payloadUserId, businessDetailsData, instagramProfileData)

loop [label: For each post, color: lightblue] {
    PayloadCMS > PayloadCMS: handlePostCreation(nPosts, instagramProfileData, updatedBusinessDetails, tenantDetails)
}

PayloadCMS > PayloadCMS: postsCreationPipeline({ posts, instagramToken, clientBusinessBio, clientLanguageStyle, clientServiceArea, clientKeywords, instagramHandle, userId, tenantId })
deactivate PayloadCMS

// User login and project setup
Client > PayloadCMS: getUserByUserId(payloadUserId)
activate PayloadCMS
PayloadCMS > PayloadCMS: loginUser(email, password, false)
PayloadCMS --> Client: API key
deactivate PayloadCMS

Client > Vercel: setupProjectAndDeploy(branchName, vercelProjectName, envVariables)
activate Vercel
Vercel --> Client: Project deployed
deactivate Vercel