import React from 'react';

const PostCard = ({ post }) => {
    return (
        <div className="post-card">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="post-image" />
            )}
            <div className="post-meta">
                <span>By: {post.authorName}</span>
                <span>{new Date(post.createdAt?.seconds * 1000).toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default PostCard;
