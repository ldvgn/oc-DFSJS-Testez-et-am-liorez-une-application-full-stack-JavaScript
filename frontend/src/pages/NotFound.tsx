import { LinkButton } from "../components/LinkButton";

export const NotFound = () => {
  return (
    <main className="flex-1 justify-items-center content-center py-12 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-base font-semibold text-indigo-400">404</p>
        <h1 className="text-4xl font-bold mb-8">Page introuvable</h1>

        <div className="mb-8">
          <p className="text-lg">
            Désolé, nous n'avons pas trouvé la page que vous recherchez.
          </p>
        </div>
        <LinkButton to="/">Retour</LinkButton>
      </div>
    </main>
  );
};
