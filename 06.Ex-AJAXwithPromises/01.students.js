$(document).ready(function() {
    const kinveyAppId = "kid_BJXTsSi-e";
    const serviceUrl = "https://baas.kinvey.com/appdata/" + kinveyAppId + "/students";
    const kinveyUsername = "guest";
    const kinveyPassword = "guest";
    const kinveyAppSecret='447b8e7046f048039d95610c1b039390';
    const base64auth = btoa(kinveyUsername + ":" + kinveyPassword);
    const authHeaders = {"Authorization": "Basic " + base64auth};
    $.get({
        url: serviceUrl,
        headers: authHeaders
    }).then(loadStudents)
        .catch(displayError);
    let table = $('#results');

    let currentRow = $("<tr>");
    currentRow.append($("<td>").append($('<input>').addClass('ID')))
        .append($("<td>").append($('<input>').addClass('FirstName')))
        .append($("<td>").append($('<input>').addClass('LastName')))
        .append($("<td>").append($('<input>').addClass('FacultyNumber')))
        .append($("<td>").append($('<input>').addClass('Grade')))
        .append($("<button>").text('Submit').addClass('add-student'));
    table.append(currentRow);
    $('.add-student').click(function () {
       let data=JSON.stringify({
           ID: Number($('.ID').val()),
           FirstName: $('.FirstName').val(),
           LastName: $('.LastName').val(),
           FacultyNumber: $('.FacultyNumber').val(),
           Grade: Number($('.Grade').val())
       });
        let request = {
            method: "POST",
            url: serviceUrl,
            headers: authHeaders,
            data: data,
            contentType: "application/json",
            dataType: 'json'
        };
       $.post(request).then(loadStudents).catch(displayError)
    });

    function loadStudents(students) {
        let table = $('#results');
        students=students.sort((a, b) => a['ID'] - b['ID']);
        for (let student of students) {
            if(!student['ID']||
                !student['FirstName']||
                !student['LastName']||
                !student['FacultyNumber']||
                !student['Grade']) {
                continue;
            }
            // console.log(student);
            let currentRow = $("<tr>");
                currentRow.append($("<td>").text(student['ID']))
                    .append($("<td>").text(student['FirstName']))
                    .append($("<td>").text(student['LastName']))
                    .append($("<td>").text(Number(student['FacultyNumber'])))
                    .append($("<td>").text(Number(student['Grade'])));
                table.append(currentRow);
        }
    }

    function displayError(error) {
        let errDiv = $("<div>").text(`Error ${error.status} : (${error.statusText})`);
        $(document.body).prepend(errDiv);
        setTimeout(function () {
            $(errDiv).fadeOut(function () {
                $(errDiv).remove();
            });
        }, 3000);
    }
});