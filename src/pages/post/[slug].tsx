import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  function readingTime() {
    if (router.isFallback) {
      return 0
    }

    let array = [];
    post.data.content.map(text => {
      array.push(
        text.heading + ' ' + text.body.map(body => body.text)
      );
    });
    let string = '';
    array.map(text => string = string + text);
    string = string.replace(/[-?,.:"“'=—\s]/g, ' ');
    let wordArray = string.split(' ');
    wordArray = wordArray.filter(item => item);

    return (Math.ceil(wordArray.length / 200));
  }

  return (
    <div className={styles.container}>
      {post.data.banner.url ? <img src={post.data.banner.url} alt="banner" /> : ''}
      <div className={styles.post}>
        <h1>{post.data.title}</h1>
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
          <div>
            <FiClock />
            <span>{readingTime()} min</span>
          </div>
        </div>
        {post.data.content.map((content, index) => (
          <div key={index}>
            <h2>{content.heading}</h2>

            {content.body.map((body, index) => (
              <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: body.text }} key={index} />
            ))}
          </div>

        ))}
      </div>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    pageSize: 2
  });

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid
      }
    }
  });

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});

  const post = await prismic.getByUID('posts', String(params.slug));

  return {
    props: { post },
    revalidate: 60 * 60 * 24
  }
};
