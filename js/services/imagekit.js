// ========================================
// IMAGEKIT SERVICE
// ========================================

const IMAGEKIT_AUTH_URL =
    "https://outsider-imagekit-auth.outsidersteams.workers.dev/";

const IMAGEKIT_UPLOAD_URL =
    "https://upload.imagekit.io/api/v1/files/upload";

// ========================================
// OBTENER AUTENTICACIÓN
// ========================================

async function getImageKitAuth() {

    const response =
        await fetch(
            IMAGEKIT_AUTH_URL,
            {
                method: "GET"
            }
        );


    if (!response.ok) {

        throw new Error(
            "No se pudo obtener la autenticación de ImageKit."
        );

    }


    const data =
        await response.json();


    if (
        !data.token ||
        !data.signature ||
        !data.expire ||
        !data.publicKey
    ) {

        throw new Error(
            "La respuesta de autenticación de ImageKit es inválida."
        );

    }


    return data;

}


// ========================================
// SUBIR IMAGEN
// ========================================

export async function uploadImage(
    file,
    options = {}
) {

    if (!(file instanceof File)) {

        throw new Error(
            "El archivo proporcionado no es válido."
        );

    }


    const auth =
        await getImageKitAuth();


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "fileName",
        options.fileName ||
        file.name
    );


    formData.append(
        "publicKey",
        auth.publicKey
    );


    formData.append(
        "signature",
        auth.signature
    );


    formData.append(
        "expire",
        auth.expire
    );


    formData.append(
        "token",
        auth.token
    );


    formData.append(
        "useUniqueFileName",
        "true"
    );


    if (options.folder) {

        formData.append(
            "folder",
            options.folder
        );

    }


    const response =
        await fetch(
            IMAGEKIT_UPLOAD_URL,
            {
                method: "POST",
                body: formData
            }
        );


    if (!response.ok) {

        const errorText =
            await response.text();

        console.error(
            "ImageKit upload error:",
            errorText
        );

        throw new Error(
            "No se pudo subir la imagen a ImageKit."
        );

    }


    const result =
        await response.json();


    return {

        url:
            result.url,

        fileId:
            result.fileId,

        filePath:
            result.filePath,

        name:
            result.name,

        width:
            result.width,

        height:
            result.height,

        size:
            result.size

    };

}


// ========================================
// ELIMINAR IMAGEN + PURGAR CACHE
// ========================================

export async function deleteImage(
    fileId,
    url
) {

    if (
        typeof fileId !== "string" ||
        !fileId.trim()
    ) {

        throw new Error(
            "El fileId de ImageKit es obligatorio."
        );

    }


    if (
        typeof url !== "string" ||
        !url.trim()
    ) {

        throw new Error(
            "La URL de la imagen es obligatoria para purgar la caché."
        );

    }


    const response =
        await fetch(
            IMAGEKIT_AUTH_URL,
            {
                method: "DELETE",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        fileId:
                            fileId.trim(),

                        url:
                            url.trim()
                    })
            }
        );


    const data =
        await response.json()
            .catch(
                () => null
            );


    if (
        response.ok ||
        response.status === 207
    ) {

        return {

            success:
                data?.success === true,

            fileDeleted:
                data?.fileDeleted === true,

            cachePurgeSubmitted:
                data?.cachePurgeSubmitted === true,

            purgeRequestId:
                data?.purgeRequestId || null

        };

    }


    console.error(
        "ImageKit delete/purge error:",
        {
            status:
                response.status,

            data
        }
    );


    throw new Error(
        data?.error ||
        "No se pudo eliminar la imagen de ImageKit."
    );

}
