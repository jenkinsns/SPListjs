/*!

splist v0.1 - A Javascript class for SharePoint REST Services

(c) 2017 Jenkins NS
splist released under the MIT license
https://github.com/jenkinsns/SPListjs/blob/master/LICENSE
*/

/* Add List Item */
function addListItem(listname,url, metadata,async, success, failure,resetMetadata) {
    // Prepping our update
	if (resetMetadata != true) {
		// if we are copying the item we use the default metadata
		var M1 = {"__metadata": { "type": getListItemType(listname) }}
		var item = $.extend(M1, metadata);
	} else {
		// if copying an item, need to remove the SP metadata before saving
		var item = metadata;
		item["__metadata"] = { "type": getListItemType(listname) }
		delete item.AttachmentFiles
		delete item.ContentType
		delete item.FieldValuesAsHtml
		delete item.FieldValuesAsText
		delete item.FieldValuesForEdit
		delete item.FirstUniqueAncestorSecurableObject
		delete item.Folder
		delete item.File
		delete item.GUID
		delete item.Id
		delete item.ID
		delete item.Modified
		delete item.RoleAssignments
		delete item.AuthorId
		delete item.EditorId
		delete item.Created
		delete item.ParentList		
	}
    // Executing our add
    $.ajax({
        url: url + "/_api/web/lists/getbytitle('" + listname + "')/items",
        type: "POST",
		async: async,
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(item),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
		success: function (data) {
			success(data);
		},
		error: function (data) {
			failure(data);
		}
    });
}

/* update List Item */
function updateListItem(listname, query, metadata, async, success, failure) {

	var url = "https://teams.aexp.com/sites/pegasuspmo"
    // Prepping our update
	var M1 = {"__metadata": { "type": getListItemType(listname) }}
	var item = $.extend(M1, metadata);	
	console.log(query)

	getListItem(listname, query, function (result) {
		console.log(item)
		console.log(JSON.stringify(item))
		$.ajax({
			url: result.__metadata.uri,
			type: "POST",
			async: false,
			contentType: "application/json;odata=verbose",
			data: JSON.stringify(item),
			headers: {
				"Accept": "application/json;odata=verbose",
				"X-RequestDigest": $("#__REQUESTDIGEST").val(),
				"X-HTTP-Method": "MERGE",
				"If-Match": result.__metadata.etag
			},
			success: function (data) {
				success(data);
			},
			error: function (data) {
				failure(data);
			}
		});

	}, function (data) {
		failure(data);
	});
}

/*delete list Item */
function deleteListItem(listname, query, success, failure) {

    // getting our item to delete, then executing a delete once it's been returned
    getListItem(listname, query, function (data) {
        $.ajax({
            url: data.__metadata.uri,
            type: "POST",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-Http-Method": "DELETE",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "If-Match": data.__metadata.etag
            },
            success: function (data) {
                success(data);
            },
            error: function (data) {
                failure(data);
            }
        });
    });

};

/* Get List Item */
function getListItem(listname,url, query, complete, failure) {
	// Getting our list item
	$.ajax({
		url:  url + "/_api/web/lists/getbytitle('" + listname + "')/items?$filter=" + query,
		method: "GET",
		async:false,
		headers: { "Accept": "application/json; odata=verbose" },
		success: function (data) {
			// Returning the results
			complete(data.d.results[0]);
		},
		error: function (data) {
			failure(data);
		}
		});
}

function getListItemWithFilter(listname, url, filter, complete, failure) {
	// Getting our list item
	$.ajax({
		url: url+ '/_vti_bin/listdata.svc/' + listname + '?$filter=' + filter,
		method: "GET",
		dataType: 'json',
		data: '',
		success: function (data) {
			// Returning the results
			complete(data.d.results[0]["Id"]);
		},
		error: function (data) {
			failure(data);
		}
		});
}


function getListItemType(name) {
	var safeListType = "SP.Data." + name[0].toUpperCase() + name.substring(1) + "ListItem"
	safeListType = safeListType.replace(/_/g,"_x005f_")
	safeListType = safeListType.replace(/ /g,"_x0020_")
    return safeListType;
}

