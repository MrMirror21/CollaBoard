import { useParams } from 'react-router-dom';

function BoardDetailPage() {
  const { boardId } = useParams();
  return <div>BoardDetail: {boardId}</div>;
}

export default BoardDetailPage;
