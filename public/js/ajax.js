    let url = 'http://localhost:3001/tables_ajax/';
    let opcion = null;
    let id, username, email, rol, password, password_confirm,row, option;


    let datatable = $('#datatable').DataTable({
        "ajax": {
            "url": url,
            "dataSrc": ""
        },
        "columns": [
            { "data": "ID" },
            { "data": "Username" },
            { "data": "Email" },
            { "data": "Rol" },
            { "defaultContent": "<button type='button' class='btn btn-primary btn_edit'><i class='fas fa-edit'></i></button> <button class='btn btn-danger btn_delete'><i class='fas fa-trash - alt'></i> </button>" }
        ]
    });
    
    $('#btn_create').on('click', function (e){
        option = "create";

        $('#passwords').show();
        $('.modal-title').text('Create User')
        $('#crud_modal').modal('show');
    })

    $(document).on("click", ".btn_edit", function () {

        option = 'edit'
        row = $(this).closest("tr");
        id = parseInt(row.find('td:eq(0)').text());
        username = row.find('td:eq(1)').text();
        email = row.find('td:eq(2)').text();
        rol = row.find('td:eq(3)').text();

        $('#passwords').hide();
        
        $('.modal-title').text('Edit User')
        $('#crud_modal').modal('show');
        
        $("#username").val(username);
        $('#email').val(email);
        $("#rol").val(rol);
    });

    $('#btn_discard').on('click', () =>{
        $('#form').trigger('reset');
    })

    
    $('#form').on('submit', function (e) {
        e.preventDefault();
        
        username = $('#username').val();
        email = $('#email').val();
        rol = $('#rol').val();
        password = $('#password').val();
        password_confirm = $('#password_confirm').val();

        if(option == 'edit'){ 
            
            $.ajax({
                url: url + id,
                method: 'put',
                contentType: 'application/json',
                data: JSON.stringify({ ID: id, Username: username, Email: email, Rol: rol }),
                success: function (data) {
                    datatable.ajax.reload(null, false);
                    $('#crud_modal').modal('hide');
                }
            });
        
        }else{

            $.ajax({
                url: 'http://localhost:3001/create_user',
                method: 'post',
                contentType: 'application/json',
                data: JSON.stringify({ 
                    username: username, 
                    email: email, 
                    rol: rol, 
                    password: password, 
                    password_confirm: password_confirm 
                }),
                success: function (data) {
                    
                    if (data.auth == false) {
                        
                        Swal.fire({
                            title: 'Error',
                            text: `The user ${data.username} already exist`,
                            icon: 'error',
                            showConfirmButton: true,
                            timer: false
                        });
                        

                    } else if (data.password == false) {
                    
                        Swal.fire({
                            title: 'Warning',
                            text: `The password doesnt match`,
                            icon: 'warning',
                            showConfirmButton: true,
                            timer: false
                        });
                        

                    } else if (data.fields == false) {
                
                        Swal.fire({
                            title: 'Warning',
                            text: `Complete all fields please`,
                            icon: 'warning',
                            showConfirmButton: true,
                            timer: false
                        });

                    } else if (data.auth == true) {
                        
                        Swal.fire({
                            title: 'Success',
                            text: `User created succesfuly`,
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 1500
                        });
                        datatable.ajax.reload(null, false);
                        $('#crud_modal').modal('hide');
                    }    
                }
            });
            
            
        }     
    });

    $(document).on("click", ".btn_delete", function () {
        row = $(this);
        id = parseInt($(this).closest('tr').find('td:eq(0)').text());
        Swal.fire({
            title: '¿Are you sure?',
            showCancelButton: true,
            confirmButtonText: `Confirm`,
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: url + id,
                    method: 'delete',
                    data: { id: id },
                    success: function () {
                        datatable.row(row.parents('tr')).remove().draw();

                    }
                });
                Swal.fire('¡User successfully removed!', '', 'success')
            }
        })
    });
    


         

