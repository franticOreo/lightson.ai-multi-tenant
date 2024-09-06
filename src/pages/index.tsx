'use client'

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { Input } from '../app/_components/Input'; 
import { Gutter } from '../app/_components/Gutter';
import { Button } from '../app/_components/Button';
import Image from 'next/image';
import lightbulbImage from '../assets/images/lightbulb.png';
import PostsImage from '../assets/images/instagramposts.png';
import PointingFingerImage from '../assets/images/pointinghand.png';
import WebsitePreviewImage from '../assets/images/websitepreview.png';
import BusinessStandImage from '../assets/images/business.png';
import PapersImage from '../assets/images/papers.png';
import CloudImage from '../assets/images/cloud.png';

import '../app/_css/home.scss';


type FormData = {
  email: string;
  instagramHandle: string;
  surveyResponse1: string;
  surveyResponse2: string;
};

const HomePage: React.FC = () =>  {



  return (
    <>
    <Gutter>
      <header>
        <div className="header-content">
          <h2>Transform your Instagram<br />into a website <br /><span>in 2 minutes</span></h2>
          <Image src={lightbulbImage} alt="Lightbulb" />
        </div>
        <div className="header-content">
          <button type='button'>
          Personalised website
          </button>
          <button type='button'>
          Blogs written based on your posts
          </button>
          <button type='button'>
            Content written for your service area
          </button>
        </div>
      </header>
    </Gutter>
    <hr />
    <Gutter>
      <section className='instagram-posts'>
          <Image src={PostsImage} alt="Posts" />
          <div className="pointing_website">
            <Image src={PointingFingerImage} alt="Pointing Finger" />
            <Image src={WebsitePreviewImage} alt="Website Preview" className='website-preview' />
          </div>
      </section>
      <section className='services'>
        <div className="service">
          <Image src={BusinessStandImage} alt="Business Stand Image" />
          <div className="title">Understands Your Business</div>
          <div className="description">
          We read your instagram profile,  understanding your business, keywords you might need and services you provide!
          </div>
        </div>
        <div className="service">
          <Image src={PapersImage} alt="Papers Image" />
          <div className="title">Writes You Local Content</div>
          <div className="description">
          Using your instagram posts, we use the same content but written for Google (Search Engine Optimised).
          </div>
        </div>
        <div className="service">
          <Image src={CloudImage} alt="Cloud Image" />
          <div className="title">Updates Automatically</div>
          <div className="description">
          You can step back and let the website run itself, unless you want to make some changes!
          </div>
        </div>
      </section>
    </Gutter>
  </>
  );
};

export default HomePage;

