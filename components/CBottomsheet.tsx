import React, { MutableRefObject, RefObject, useEffect, useRef } from "react";
import { BottomSheetModal, BottomSheetProps } from "@gorhom/bottom-sheet";
import { BackHandler } from "react-native";

enum ModalStates {
   OPEN,
   CLOSE,
}

interface CBottomSheetModal extends BottomSheetProps {
   cRef?: RefObject<BottomSheetModal>;
}

export default function CBottomSheetModal({
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   cRef,
   ...props
}: CBottomSheetModal) {
   const true_ref = useRef<BottomSheetModal>(null);
   const modal_state = useRef(ModalStates.CLOSE);

   useEffect(() => {
      if (!cRef) {
         return;
      }
      (cRef as MutableRefObject<BottomSheetModal>).current = {
         close(animationConfigs) {
            modal_state.current = ModalStates.CLOSE;
            true_ref.current!.close(animationConfigs);
         },
         present(data) {
            modal_state.current = ModalStates.OPEN;
            true_ref.current!.present(data);
         },
         forceClose(animationConfigs) {
            modal_state.current = ModalStates.CLOSE;
            true_ref.current!.forceClose(animationConfigs);
         },
         collapse: (x) => true_ref.current!.collapse(x),
         dismiss: (x) => true_ref.current!.dismiss(x),
         expand: (x) => true_ref.current!.expand(x),
         snapToIndex: (x) => true_ref.current!.snapToIndex(x),
         snapToPosition: (x) => true_ref.current!.snapToPosition(x),
      };

      const backHandler = BackHandler.addEventListener(
         "hardwareBackPress",
         () => {
            if (modal_state.current === ModalStates.CLOSE) {
               return false;
            }
            modal_state.current = ModalStates.CLOSE;
            true_ref.current!.close();
            return true;
         }
      );

      return () => backHandler.remove();
   }, []);
   return <BottomSheetModal ref={true_ref} {...props} />;
}
