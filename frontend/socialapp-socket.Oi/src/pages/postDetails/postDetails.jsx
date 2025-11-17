import { useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
const PostDetails = () => {
const [searchParams] = useSearchParams();
const commentIdToHighlight = searchParams.get('comment');
const commentRefs = useRef({});

useEffect(() => {
    if (commentIdToHighlight && commentRefs.current[commentIdToHighlight]) {
        commentRefs.current[commentIdToHighlight].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        // 🚨 يجب إزالة الـ Query Parameter بعد التمرير لتنظيف الـ URL
        // مثلاً: setSearchParams({}, { replace: true });
    }
}, [commentIdToHighlight, /* إضافة حالة تحميل التعليقات هنا */]);
  return (
    <div>
      
    </div>
  );
}

export default PostDetails;
