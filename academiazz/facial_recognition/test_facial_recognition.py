# # facial_recognition/capture_and_store.py

# import os
# from facial_recognition.utils import init_face_model, read_image, get_face_embedding
# from facial_recognition.pinecone_utils import init_pinecone_index, store_embedding, find_best_match
# import cv2


# api_key = os.environ.get("PINECONE_API_KEY")

# model = init_face_model()
# index = init_pinecone_index(api_key)

# SCRIPT_DIR = os.path.dirname(__file__)

# img_path = os.path.join(SCRIPT_DIR, "face.jpg")

# print (f"{img_path}")


# img = read_image(img_path)  

# embedding = get_face_embedding(img)
# if embedding is None:
#     print("No face detected!")
# else:

#     store_embedding(user_id="25", embedding=embedding)
#     print("Embedding stored successfully!")
# is_match, matched_id, score = find_best_match(index, embedding)

# print("Match found:", is_match)
# print("Matched ID:", matched_id)
# print("Similarity score:", score)

# # Threshold for considering a match
# MATCH_THRESHOLD = 0.6

# print("Press 'q' to quit")

# while True:
#     # Use your existing read_image function to capture from webcam
#     frame = read_image(from_webcam=True)

#     # Get face embedding
#     embedding = get_face_embedding(frame)
    
#     if embedding is not None:
#         # Compare with Pinecone database
#         matched, user_id, score = find_best_match(index, embedding, threshold=MATCH_THRESHOLD)
        
#         if matched:
#             text = f"Match: {user_id} ({score:.2f})"
#             color = (0, 255, 0)  # Green for match
#         else:
#             text = f"No match ({score:.2f})"
#             color = (0, 0, 255)  # Red for no match
#     else:
#         text = "No face detected"
#         color = (0, 0, 255)

#     # Display result on the frame
#     cv2.putText(frame, text, (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
#     cv2.imshow("Face Recognition Test", frame)

#     # Quit on pressing 'q'
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# cv2.destroyAllWindows()
