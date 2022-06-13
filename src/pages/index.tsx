import { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { FiCalendar, FiUser } from "react-icons/fi";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [loadMore, setLoadMore] = useState(postsPagination.next_page);

  const loadMorePosts = ((url: string) => {
    fetch(url)
      .then(res => res.json())
      .then(data => {

        const postsPagination: PostPagination = {
          next_page: data.next_page,
          results: data.results.map(post => {
            return {
              uid: post.uid,
              first_publication_date: post.first_publication_date,
              data: {
                title: post.data.title,
                subtitle: post.data.subtitle,
                author: post.data.author,
              }
            }
          })
        };

        postsPagination.next_page ? setLoadMore(postsPagination.next_page) : setLoadMore(null);
        setPosts(prevState => [...prevState, ...postsPagination.results]);
      });
  });


  return (
    <div className={styles.container}>
      {posts.map(post => (
        <Link href={`/post/${post.uid}`} key={post.uid}>
          <a className={styles.postContainer}>
            <h1>{post.data.title}</h1>
            <p>{post.data.subtitle}</p>
            <div className={styles.postInfo}>
              <div>
                <FiCalendar />
                <time>{format(new Date(post.first_publication_date), "d MMM yyyy",
                  {
                    locale: ptBR,
                  })}
                </time>
              </div>
              <div>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
            </div>
          </a>
        </Link>
      ))}
      {loadMore ? <span className={styles.loadMore} onClick={() => loadMorePosts(loadMore)}>Carregar mais posts</span> : null}

    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 2
  });

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    })
  };

  return {
    props: { postsPagination }
  }
};
