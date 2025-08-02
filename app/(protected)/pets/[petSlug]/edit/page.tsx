import EditPetForm from "@/components/forms/edit-pet-form";
import Modal from "@/components/ui/modal";

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
