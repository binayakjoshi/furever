import EditPetForm from "@/Components/Forms/edit-pet-form";
import Modal from "@/Components/UI/modal";

const EditPetPage = async () => {
  return (
    <>
      <Modal>
        <EditPetForm />
      </Modal>
    </>
  );
};
export default EditPetPage;
