import EditPetForm from "@/Components/Pets/edit-pet";
import Modal from "@/Components/UI/modal";

// type EditPetPageProps = {
//     params: Promise<{slug?:string}>
// }
const EditPetPage = () => {
  //const slug = await params;
  return (
    <>
      <Modal>
        <EditPetForm />
      </Modal>
    </>
  );
};
export default EditPetPage;
