import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import PostCard from '../components/PostCard';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const q = query(
                    collection(db, 'posts'),
                    where('isPublic', '==', true),
                    orderBy('createdAt', 'desc'),
                    limit(10)
                );
                const querySnapshot = await getDocs(q);
                const postsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPosts(postsData);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) return <div className="loading">Loading posts...</div>;

    return (
        <div className="home">
            <header className="hero">
                <h1>Welcome to Our Basketball Club</h1>
                <p>Stay updated with the latest news and events</p>
            </header>
            <section className="latest-posts">
                <h2>Latest Updates</h2>
                {posts.length > 0 ? (
                    <div className="posts-grid">
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <p>No posts available yet.</p>
                )}
            </section>
        </div>
    );
};

export default Home;
