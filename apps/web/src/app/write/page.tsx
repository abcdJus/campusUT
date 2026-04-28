import { api } from "@/lib/api";
import { WritePostForm } from "@/components/WritePostForm";

export default async function WritePage() {
  const { items: boards } = await api.getBoards();

  return (
    <main className="page-shell narrow">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Create</p>
          <h1>New post</h1>
        </div>
      </div>
      <WritePostForm boards={boards} />
    </main>
  );
}
