import config from "../../../../../ipconfig.js";
import { createPost, editPost, deletePost, getAllPost, getPostDetails, uploadPostFiles, getPostFiles, createPostTags, deletePostTags, getPostTags, getPostsByTagName } from './postApi.js';
var postTags = [];
var images = [];
var imageFile = [];
var postContent = "";
window.addEventListener('DOMContentLoaded', function () {
    getAllPost();
    document.querySelector('#postImage').addEventListener('change', async function (e) {
        let imageInput = await document.getElementById('postImage').files;
        for (let i = 0; i < imageInput.length; i++) {
            images.push({
                "name": imageInput[i].name,
                "url": URL.createObjectURL(imageInput[i]),
            });
            imageFile.push({
                "file": imageInput[i]
            })

        }
        preViewImage();


    });
    this.document.querySelector('#postContent').addEventListener('input', async function (e) {
        postContent = e.target.value;
        console.log(postContent);
    })
});




async function preViewImage() {
    //圖片預覽
    let preViewImageList = "";
    const imageContainer = document.querySelector('#image-container');
    imageContainer.innerHTML = '';
    images.forEach((e) => {
        preViewImageList += `
            <img src="${e.url}" alt="image" class="img-fluid" style="height:200px; width:21%">
          <button class="position-relative" id="deleteImg" data-id="${images.indexOf(e)}">&times;</button>
      `;
    });

    imageContainer.innerHTML = preViewImageList;
    deleteImg();
}

async function deleteImg() {
    //刪除圖片
    const deleteImgs = document.querySelectorAll('#deleteImg');
    deleteImgs.forEach((deleteImg) => {
        deleteImg.addEventListener('click', function (e) {
            e.preventDefault();
            let id = this.dataset.id;
            console.log(id);
            images.splice(id, 1);
            preViewImage();

        })
    })
}

// The DOM element you wish to replace with Tagify
var input = document.querySelector('input[name=basic]');
// initialize Tagify on the above input node reference
new Tagify(input)
input.addEventListener('change', function (e) {
    let inputTags = JSON.parse(e.target.value);
    postTags = [];
    inputTags.forEach((e) => {
        postTags.push(e.value);
        console.log(postTags);
    })

})

async function addPost() {
    //刪除圖片
    const createPostBtn = document.querySelectorAll('#createPost');
    createPostBtn.addEventListener('click', async function (e) {

        let postData = {
            content: postContent,
        }
        let data = await createPost(postData);
        if (data.code === 200) {
            let dataDetails = data.message;
            let postId = dataDetails.postId;
            if (postTags.length !== 0 && imageFile.length !== 0) {
                //redis
                let tagData = {
                    "tags": postTags
                }

                let imageFormData = new FormData();
                for (let i = 0; i < imageFile.length; i++) {
                    imageFormData.append("file", imageFile[i]);
                }
                let tagCreateResult = await createPostTags(postId, tagData);
                let fileResult = await uploadPostFiles(postId, imageFormData);
                try {
                    tagCreateResult = await createPostTags(postId, tagData);
                    fileResult = await uploadPostFiles(postId, imageFormData);
                    if (fileResult === 200) {
                        console.log("貼文檔案新增成功");
                    }
                } catch (error) {
                    console.log("貼文檔案新增失敗");
                }


            }



        } else {
            console.log("新增貼文失敗");
        }



    })
}

